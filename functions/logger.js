const chalk = require('chalk');

class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levelWeights = {
      debug: 10,
      info: 20,
      warn: 30,
      error: 40,
    };
  }

  shouldLog(level) {
    return this.levelWeights[level] >= this.levelWeights[this.level];
  }

  write(level, message, context = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const prefix = `[${level.toUpperCase()}]`;
    const contextText = Object.entries(context)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    const line = contextText ? `${prefix} ${message} ${contextText}` : `${prefix} ${message}`;

    if (level === 'error') {
      console.error(chalk.red(line));
      return;
    }

    if (level === 'warn') {
      console.warn(chalk.yellow(line));
      return;
    }

    console.log(level === 'info' ? chalk.cyan(line) : line);
  }

  debug(message, context) {
    this.write('debug', message, context);
  }

  info(message, context) {
    this.write('info', message, context);
  }

  warn(message, context) {
    this.write('warn', message, context);
  }

  error(message, context) {
    this.write('error', message, context);
  }
}

module.exports = {
  Logger,
};
