require('dotenv').config();
const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  try {
    const authenticationHeader = req.headers['authorization'];
    const token = authenticationHeader && authenticationHeader.split(' ')[1];

    if (!token) {
      const error = new Error('Access token missing');
      error.statusCode = 401;
      throw error;
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
