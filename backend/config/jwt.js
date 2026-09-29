const JWT_SECRET = process.env.JWT_SECRET || 'medicare_default_secret_key_999';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

module.exports = JWT_SECRET;