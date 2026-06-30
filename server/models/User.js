import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
  },
  role: {
    type: String,
    enum: ["citizen", "org_admin"],
    default: "citizen",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
