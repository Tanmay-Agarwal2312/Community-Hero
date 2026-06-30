import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Issue from "../models/Issue.js";
import { ensureAuth, ensureRole } from "../middleware/auth.js";
import { categorizeImage } from "../services/gemini.js";

const router = Router();

// --------------- Multer Configuration ---------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype.split("/")[1]);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
    }
  },
});

// --------------- Routes ---------------

// POST / — Create a new issue
router.post("/", ensureAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Photo is required" });
    }

    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid lat and lng are required" });
    }

    // Call Gemini AI for categorization
    const imageBuffer = fs.readFileSync(req.file.path);
    const aiResult = await categorizeImage(imageBuffer, req.file.mimetype);

    // Duplicate detection: find issues within 50m with same category and not resolved
    const duplicates = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 50,
        },
      },
      category: aiResult.category,
      status: { $ne: "resolved" },
    })
      .populate("reporterId", "name photoUrl")
      .limit(5)
      .lean();

    if (duplicates.length > 0 && req.body.confirmNew !== "true") {
      return res.status(200).json({
        duplicatesFound: true,
        duplicates: duplicates,
        aiResult: aiResult,
        photoUrl: `/uploads/${req.file.filename}`,
      });
    }

    // Create the issue
    const issue = await Issue.create({
      reporterId: req.user._id,
      photoUrl: `/uploads/${req.file.filename}`,
      description: req.body.description || aiResult.short_description,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      category: aiResult.category,
      severity: aiResult.severity,
      citizenFixable: aiResult.citizen_fixable,
      aiDescription: aiResult.short_description,
      status: "reported",
    });

    const populated = await Issue.findById(issue._id).populate(
      "reporterId",
      "name photoUrl"
    );

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating issue:", error);
    return res.status(500).json({ error: "Failed to create issue" });
  }
});

// GET / — List issues with optional filters
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const issues = await Issue.find(filter)
      .populate("reporterId", "name photoUrl")
      .populate("resolvedBy", "name photoUrl")
      .sort({ createdAt: -1 });

    return res.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// GET /:id — Single issue
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reporterId", "name photoUrl")
      .populate("resolvedBy", "name photoUrl");

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    return res.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return res.status(500).json({ error: "Failed to fetch issue" });
  }
});

// POST /:id/resolve — Submit resolution proof
router.post(
  "/:id/resolve",
  ensureAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      const issue = await Issue.findById(req.params.id);

      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      // Check permission: citizen-fixable issues can be resolved by any citizen,
      // otherwise only org_admin can resolve
      if (!issue.citizenFixable && req.user.role !== "org_admin") {
        return res.status(403).json({
          error:
            "Only org_admin can resolve this issue (not citizen-fixable)",
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Resolution proof photo is required" });
      }

      // Only allow resolution from certain statuses
      const resolvableStatuses = ["verified", "in_progress"];
      if (!resolvableStatuses.includes(issue.status)) {
        return res.status(400).json({
          error: `Cannot resolve an issue with status "${issue.status}". Issue must be "verified" or "in_progress".`,
        });
      }

      issue.status = "resolved_pending_verification";
      issue.resolutionProofUrl = `/uploads/${req.file.filename}`;
      issue.resolvedBy = req.user._id;
      await issue.save();

      const populated = await Issue.findById(issue._id)
        .populate("reporterId", "name photoUrl")
        .populate("resolvedBy", "name photoUrl");

      return res.json(populated);
    } catch (error) {
      console.error("Error resolving issue:", error);
      return res.status(500).json({ error: "Failed to resolve issue" });
    }
  }
);

// PATCH /:id/status — Manual status transition (org_admin only)
router.patch("/:id/status", ensureAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "New status is required" });
    }

    // Define legal transitions
    const legalTransitions = {
      verified: ["in_progress"],
      in_progress: ["verified"], // allow reverting if needed
    };

    const allowed = legalTransitions[issue.status];

    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from "${issue.status}" to "${status}"`,
      });
    }

    // Only org_admin can do manual transitions
    if (req.user.role !== "org_admin") {
      return res
        .status(403)
        .json({ error: "Only org_admin can change issue status" });
    }

    issue.status = status;
    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate("reporterId", "name photoUrl")
      .populate("resolvedBy", "name photoUrl");

    return res.json(populated);
  } catch (error) {
    console.error("Error updating issue status:", error);
    return res.status(500).json({ error: "Failed to update issue status" });
  }
});

export default router;
