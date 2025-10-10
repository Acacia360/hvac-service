const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

exports.generateToken = (user) => {
  return jwt.sign(
    {
        id: user.id,
        email: user.email,
        roleId: user.role?.id,
        propertyId: user.propertyId,
        role: user.role?.name,
      },
    secret,
    { expiresIn: '48h' }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(token, secret);
};
