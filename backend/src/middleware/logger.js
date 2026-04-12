import logger from "../logger.js";

export const requestLogger = (req, res, next) => {
  logger.info({
    msg: "incoming request",
    method: req.method,
    url: req.url,
  });

  next();
};