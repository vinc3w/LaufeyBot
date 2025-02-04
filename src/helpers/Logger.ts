import pino from "pino";
import pretty from "pino-pretty";

export default class Logger {
  
  static pinoLogger = pino(pretty());

  static info(message: any) {
    this.pinoLogger.info(message);
  }

  static success(message: any) {
    this.pinoLogger.info(message);
  }

  static warn(message: any) {
    this.pinoLogger.warn(message);
  }

  static error(message: any) {
    this.pinoLogger.error(message);
  }

  static debug(message: any) {
    this.pinoLogger.debug(message);
  }

};
