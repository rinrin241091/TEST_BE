const adminMiddleware = (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }

  next();
};

module.exports = adminMiddleware;
