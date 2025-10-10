const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.user_role_name !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = authorize;
