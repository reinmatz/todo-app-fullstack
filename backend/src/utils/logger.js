import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log Levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log Colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Custom Format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console Format (for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Log directory
const logDir = path.join(__dirname, '../../logs');

// Transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file with rotation
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: format,
  }),

  // Combined log file with rotation
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: format,
  }),

  // Security log file (for security events)
  new DailyRotateFile({
    filename: path.join(logDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxSize: '20m',
    maxFiles: '30d',
    format: format,
  }),
];

// Create logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Helper functions for security logging
logger.logSecurityEvent = (event, details) => {
  logger.warn(`SECURITY: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

logger.logAuthSuccess = (userId, username, ip) => {
  logger.info('Authentication successful', {
    userId,
    username,
    ip,
    event: 'AUTH_SUCCESS',
  });
};

logger.logAuthFailure = (email, ip, reason) => {
  logger.logSecurityEvent('AUTH_FAILURE', {
    email,
    ip,
    reason,
  });
};

logger.logRateLimitViolation = (ip, endpoint) => {
  logger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
    ip,
    endpoint,
  });
};

logger.logInputValidationFailure = (field, value, ip) => {
  logger.logSecurityEvent('INPUT_VALIDATION_FAILURE', {
    field,
    value: typeof value === 'string' ? value.substring(0, 50) : value,
    ip,
  });
};

logger.logUnauthorizedAccess = (userId, resource, ip) => {
  logger.logSecurityEvent('UNAUTHORIZED_ACCESS', {
    userId,
    resource,
    ip,
  });
};

// HTTP Request Logger
logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

// Database Query Logger
logger.logQuery = (query, duration) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database Query', {
      query: query.substring(0, 200),
      duration: `${duration}ms`,
    });
  }
};

// Export logger
export default logger;
