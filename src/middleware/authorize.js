const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.user_role_name !== requiredRole) {
      const error = new Error('Forbidden: Insufficient permissions');
      error.statusCode = 403;
      return next(error); 
    }
    next();
  };
};

module.exports = authorize;