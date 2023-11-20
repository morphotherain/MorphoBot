// log.js
const LogLevel = {
    DEBUG: { value: 0, name: 'DEBUG', color: 'gray' },
    INFO: { value: 1, name: 'INFO', color: 'green' },
    WARN: { value: 2, name: 'WARN', color: 'darkorange' },
    ERROR: { value: 3, name: 'ERROR', color: 'red' },
  };
  
class Logger {
  constructor(level = LogLevel.DEBUG) {
    this.level = level;
  }

  log(message, level = LogLevel.INFO) {
    if (level.value < this.level.value) return;

    const error = new Error();
    const stackLine = error.stack.split("\n")[3]; // 修改为3以正确获取调用log方法的位置
    const match = stackLine.match(/(?:\w+:\/\/)?(?:[^/]+\/)*([^:]+):\d+:\d+/);
    const fileName = match ? match[1] : "unknown file";

    const output = `<span style="color: ${level.color}">${fileName} ${level.name}: ${message}</span><br>`;

  }

  debug(message) {
    this.log(message, LogLevel.DEBUG);
  }

  info(message) {
    this.log(message, LogLevel.INFO);
  }

  warn(message) {
    this.log(message, LogLevel.WARN);
  }

  error(message) {
    this.log(message, LogLevel.ERROR);
  }
}
  

const logger = new Logger(LogLevel.DEBUG);
module.exports = logger;