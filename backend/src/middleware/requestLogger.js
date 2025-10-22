import logger from '../utils/logger.js';

/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests with response time
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.logRequest(req, res, duration);

    // Log slow requests as warnings
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

export default requestLogger;
