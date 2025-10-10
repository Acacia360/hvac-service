require('dotenv').config();
const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {  
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
