const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026_codealpha';
  
  const token = jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  // Set HTTP-only cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: (parseInt(process.env.COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000,
  };

  res.cookie('jwt', token, cookieOptions);
  return token;
};

module.exports = generateToken;
