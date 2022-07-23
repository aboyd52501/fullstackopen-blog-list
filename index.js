const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const { PORT } = require('./utils/config');

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`server running on port ${PORT}`);
});
