const jwt = require('jsonwebtoken');

exports.verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};
