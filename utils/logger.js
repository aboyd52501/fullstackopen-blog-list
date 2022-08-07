// Don't log info during tests
const TESTING = process.env.NODE_ENV === 'test';

const info = (...args) => {
  if (!TESTING) console.log(...args);
};

const error = (...args) => {
  if (!TESTING) console.error(...args);
};

module.exports = {
  info,
  error,
};
