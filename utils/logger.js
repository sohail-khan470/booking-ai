// utils/logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;

    if (Object.keys(meta).length > 0) {
      const { timestamp: _, level: __, ...cleanMeta } = meta;
      if (Object.keys(cleanMeta).length > 0) {
        log += `\n${JSON.stringify(cleanMeta, null, 2)}`;
      }
    }

    return log;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: "debug",
  format: logFormat,
  defaultMeta: { service: "vapi-service" },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // All logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // VAPI-specific debug logs
    new winston.transports.File({
      filename: path.join(logDir, "vapi-debug.log"),
      level: "debug",
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Always log to console for development
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// Helper methods for specific log types
logger.webhook = function (eventType, webhookData) {
  this.debug(`WEBHOOK: ${eventType}`, {
    eventType,
    callId: webhookData.call?.id,
    functionName: webhookData.functionCall?.name,
  });
};

logger.functionCall = function (functionName, parameters, callId) {
  this.debug(`FUNCTION CALL: ${functionName}`, {
    functionName,
    parameters,
    callId,
  });
};

logger.database = function (operation, data) {
  this.debug(`DATABASE: ${operation}`, data);
};

logger.errorWithContext = function (context, error, additionalData = {}) {
  this.error(`ERROR in ${context}: ${error.message}`, {
    context,
    error: error.message,
    stack: error.stack,
    ...additionalData,
  });
};

// Method to get log file contents
logger.getLogContents = function (filename = "vapi-debug.log") {
  try {
    const logPath = path.join(logDir, filename);
    if (fs.existsSync(logPath)) {
      return fs.readFileSync(logPath, "utf8");
    }
    return `Log file ${filename} not found.`;
  } catch (error) {
    return `Error reading log file: ${error.message}`;
  }
};

module.exports = logger;
