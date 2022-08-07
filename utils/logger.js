const fs = require('fs');

const TESTING = process.env.NODE_ENV === 'test';
const LOGFILE = './.testoutput';

if (fs.existsSync(LOGFILE)) fs.unlinkSync(LOGFILE);

const writeLog = (content) => (
  fs.writeFileSync(LOGFILE, content, { flag: 'a' })
);

const info = (...args) => {
  if (!TESTING) console.log(...args);
  else writeLog(`${args.map((x) => x.toString()).join(' ')}\n`);
};

const error = (...args) => {
  if (!TESTING) console.error(...args);
  else writeLog(`E: ${args.map(((x) => x.toString())).join(' ')}\n`);
};

module.exports = {
  info,
  error,
};
