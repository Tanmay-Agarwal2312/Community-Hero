import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const router = Router();

// Hardcoded admin emails — change these to your own
const ADMIN_EMAILS = ["tagarwal_be24@thapar.edu"];

// --------------- Passport Strategy ---------------

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : "";

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update fields in case they changed
          user.name = profile.displayName;
          user.email = email;
          user.photoUrl =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : user.photoUrl;
          user.role = ADMIN_EMAILS.includes(email) ? "org_admin" : "citizen";
          await user.save();
        } else {
          const role = ADMIN_EMAILS.includes(email) ? "org_admin" : "citizen";
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            photoUrl:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : "",
            role: role,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// --------------- Serialization ---------------

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --------------- Routes ---------------

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL || "http://localhost:5173",
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Get current user
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      _id: req.user._id,
      googleId: req.user.googleId,
      name: req.user.name,
      email: req.user.email,
      photoUrl: req.user.photoUrl,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  }
  return res.json(null);
});

export default router;
