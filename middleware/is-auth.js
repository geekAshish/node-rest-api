const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if(!authHeader) {
    const error = new Error('Not authenticated!');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')?.[0];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, 'someSuperSecretSecreteKey');
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if(!decodeToken) {
    const error = new Error('Not authenticated!');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodeToken.userId;
  next();
}
