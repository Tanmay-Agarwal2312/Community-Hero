import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import issueRoutes from "./routes/issues.js";
import voteRoutes from "./routes/votes.js";
import dashboardRoutes from "./routes/dashboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/community-hero";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET || "community-hero-secret-key-change-me";

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --------------- Middleware ---------------

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session with MongoStore
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// --------------- Routes ---------------

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --------------- Start Server ---------------

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🌐 Client URL: ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();
