export function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

export function ensureRole(role) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ error: `Access denied. Required role: ${role}` });
    }
    return next();
  };
}
