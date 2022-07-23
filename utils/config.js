require('dotenv').config();

const { MONGODB_URI } = process.env;
const PORT = process.env.port || 3003;

module.exports = {
  PORT,
  MONGODB_URI,
};
