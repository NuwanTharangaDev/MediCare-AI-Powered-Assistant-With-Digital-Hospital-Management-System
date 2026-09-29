const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');

const allowedRoles = new Set(['admin', 'doctor', 'patient', 'nurse']);

function optionalAuth(req, res, next) {
  const authorization = req.get('authorization');
  if (!authorization) {
    req.user = null;
    return next();
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'A valid bearer token is required.' });
  }

  try {
    const tokenUser = jwt.verify(match[1], JWT_SECRET);
    const userId = Number(tokenUser.id);
    const role = String(tokenUser.role || '').toLowerCase();
    if (!Number.isSafeInteger(userId) || userId < 1 || !allowedRoles.has(role)) {
      return res.status(401).json({ success: false, message: 'The access token is invalid.' });
    }

    req.user = { id: userId, role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'The access token is invalid or expired.' });
  }
}

module.exports = optionalAuth;