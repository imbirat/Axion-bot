const chalk = require('chalk');

function timestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

const logger = {
  info: (...args) => console.log(chalk.cyan(`[${timestamp()}] [INFO]`), ...args),
  warn: (...args) => console.log(chalk.yellow(`[${timestamp()}] [WARN]`), ...args),
  error: (...args) => console.log(chalk.red(`[${timestamp()}] [ERROR]`), ...args),
  success: (...args) => console.log(chalk.green(`[${timestamp()}] [SUCCESS]`), ...args),
  debug: (...args) => console.log(chalk.magenta(`[${timestamp()}] [DEBUG]`), ...args),
};

module.exports = logger;
