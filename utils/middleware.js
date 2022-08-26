const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:', req.path);
  logger.info('Body:', req.body);
  logger.info('---');
  next();
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  } else req.token = null;

  next();
};

const userExtractor = async (req, res, next) => {
  if (req.token) {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({
        error: 'token missing or invalid',
      });
    }
    const user = await User.findById(decodedToken.id);

    if (!user) return res.status(400).json({ error: 'user not found' });

    req.user = user;
  }

  return next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformed id' });
  } if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  } if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: err.message });
  } if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'login session expired' });
  }

  return next(err);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
