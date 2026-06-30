import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    category: {
      type: String,
      enum: [
        "pothole",
        "garbage",
        "streetlight",
        "water_leak",
        "road_damage",
        "other",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    citizenFixable: {
      type: Boolean,
      default: false,
    },
    aiDescription: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "reported",
        "verified",
        "in_progress",
        "resolved_pending_verification",
        "resolved",
      ],
      default: "reported",
    },
    disputed: {
      type: Boolean,
      default: false,
    },
    resolutionProofUrl: {
      type: String,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

IssueSchema.index({ location: "2dsphere" });

const Issue = mongoose.model("Issue", IssueSchema);
export default Issue;
