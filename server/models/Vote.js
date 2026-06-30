import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
  stage: {
    type: String,
    enum: ["report_verification", "resolution_verification"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

VoteSchema.index({ userId: 1, issueId: 1, stage: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VoteSchema);
export default Vote;
