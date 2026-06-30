import { Router } from "express";
import Vote from "../models/Vote.js";
import Issue from "../models/Issue.js";
import { ensureAuth } from "../middleware/auth.js";

const router = Router();

// POST /:issueId — Cast a vote
router.post("/:issueId", ensureAuth, async (req, res) => {
  try {
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: "Vote value must be 1 or -1" });
    }

    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Determine the voting stage based on issue status
    let stage;
    if (issue.status === "reported") {
      stage = "report_verification";
    } else if (issue.status === "resolved_pending_verification") {
      stage = "resolution_verification";
    } else {
      return res.status(400).json({
        error: `Voting is not allowed when issue status is "${issue.status}". Only "reported" or "resolved_pending_verification" issues accept votes.`,
      });
    }

    // Don't allow reporter to vote on their own issue during report_verification
    if (
      stage === "report_verification" &&
      issue.reporterId.toString() === req.user._id.toString()
    ) {
      return res.status(403).json({
        error: "You cannot vote on your own issue during report verification",
      });
    }

    // Check for existing vote
    const existingVote = await Vote.findOne({
      userId: req.user._id,
      issueId: issue._id,
      stage: stage,
    });

    if (existingVote) {
      return res.status(409).json({
        error: "You have already voted on this issue for this stage",
      });
    }

    // Create the vote
    const vote = await Vote.create({
      userId: req.user._id,
      issueId: issue._id,
      value: value,
      stage: stage,
    });

    // Calculate net votes for current stage
    const votes = await Vote.find({ issueId: issue._id, stage: stage });
    const netVotes = votes.reduce((sum, v) => sum + v.value, 0);
    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;

    // Auto-transition logic
    if (stage === "report_verification" && netVotes >= 5) {
      issue.status = "verified";
      await issue.save();
    }

    if (stage === "resolution_verification") {
      // Mark as disputed if a downvote is cast
      if (value === -1) {
        issue.disputed = true;
        await issue.save();
      }

      if (netVotes >= 3) {
        issue.status = "resolved";
        await issue.save();
      }
    }

    // Reload issue to get latest state
    const updatedIssue = await Issue.findById(issue._id)
      .populate("reporterId", "name photoUrl")
      .populate("resolvedBy", "name photoUrl");

    return res.status(201).json({
      vote: vote,
      issue: updatedIssue,
      voteCounts: {
        stage: stage,
        upvotes: upvotes,
        downvotes: downvotes,
        net: netVotes,
      },
    });
  } catch (error) {
    // Handle duplicate key error (race condition safety)
    if (error.code === 11000) {
      return res.status(409).json({
        error: "You have already voted on this issue for this stage",
      });
    }
    console.error("Error casting vote:", error);
    return res.status(500).json({ error: "Failed to cast vote" });
  }
});

// GET /:issueId — Get vote counts and user's existing vote
router.get("/:issueId", async (req, res) => {
  try {
    const issueId = req.params.issueId;

    // Get all votes for this issue grouped by stage
    const allVotes = await Vote.find({ issueId: issueId });

    const reportVotes = allVotes.filter(
      (v) => v.stage === "report_verification"
    );
    const resolutionVotes = allVotes.filter(
      (v) => v.stage === "resolution_verification"
    );

    const reportCounts = {
      upvotes: reportVotes.filter((v) => v.value === 1).length,
      downvotes: reportVotes.filter((v) => v.value === -1).length,
      net: reportVotes.reduce((sum, v) => sum + v.value, 0),
    };

    const resolutionCounts = {
      upvotes: resolutionVotes.filter((v) => v.value === 1).length,
      downvotes: resolutionVotes.filter((v) => v.value === -1).length,
      net: resolutionVotes.reduce((sum, v) => sum + v.value, 0),
    };

    // Check if the current user has voted (only if authenticated)
    let userVote = null;
    if (req.isAuthenticated && req.isAuthenticated()) {
      const userVotes = await Vote.find({
        issueId: issueId,
        userId: req.user._id,
      });
      userVote = {};
      for (const v of userVotes) {
        userVote[v.stage] = v.value;
      }
      if (Object.keys(userVote).length === 0) {
        userVote = null;
      }
    }

    return res.json({
      report_verification: reportCounts,
      resolution_verification: resolutionCounts,
      userVote: userVote,
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return res.status(500).json({ error: "Failed to fetch votes" });
  }
});

export default router;
