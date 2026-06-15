const chalk = require('chalk');

const logger = {
  info: (msg) => console.log(chalk.blue('[INFO]'), msg),
  success: (msg) => console.log(chalk.green('[OK]'), msg),
  warn: (msg) => console.log(chalk.yellow('[WARN]'), msg),
  error: (msg) => console.log(chalk.red('[ERROR]'), msg),
  cmd: (msg) => console.log(chalk.cyan('[CMD]'), msg),
  event: (msg) => console.log(chalk.magenta('[EVT]'), msg),
  db: (msg) => console.log(chalk.green('[DB]'), msg),
};

module.exports = logger;
