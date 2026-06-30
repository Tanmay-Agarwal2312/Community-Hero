import { Router } from "express";
import Issue from "../models/Issue.js";

const router = Router();

// GET /stats — Total, resolved, pending counts
router.get("/stats", async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: "resolved" });
    const pending = await Issue.countDocuments({
      status: { $in: ["verified", "in_progress", "resolved_pending_verification"] },
    });

    return res.json({ total, resolved, pending });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /by-category — Issue count grouped by category
router.get("/by-category", async (req, res) => {
  try {
    const allCategories = [
      "pothole",
      "garbage",
      "streetlight",
      "water_leak",
      "road_damage",
      "other",
    ];

    const results = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Ensure all categories are represented
    const categoryMap = {};
    for (const cat of allCategories) {
      categoryMap[cat] = 0;
    }
    for (const r of results) {
      categoryMap[r._id] = r.count;
    }

    const data = allCategories.map((cat) => ({
      category: cat,
      count: categoryMap[cat],
    }));

    return res.json(data);
  } catch (error) {
    console.error("Error fetching by-category:", error);
    return res.status(500).json({ error: "Failed to fetch category stats" });
  }
});

// GET /by-status — Issue count grouped by status
router.get("/by-status", async (req, res) => {
  try {
    const allStatuses = [
      "reported",
      "verified",
      "in_progress",
      "resolved_pending_verification",
      "resolved",
    ];

    const results = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Ensure all statuses are represented
    const statusMap = {};
    for (const s of allStatuses) {
      statusMap[s] = 0;
    }
    for (const r of results) {
      statusMap[r._id] = r.count;
    }

    const data = allStatuses.map((s) => ({
      status: s,
      count: statusMap[s],
    }));

    return res.json(data);
  } catch (error) {
    console.error("Error fetching by-status:", error);
    return res.status(500).json({ error: "Failed to fetch status stats" });
  }
});

export default router;
