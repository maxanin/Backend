import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { env } from "../config/env";
import ErrorLog from "../models/ErrorLog";

export async function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, "Unhandled error");
  
  // Attempt to log error to database, but don't fail if logging fails
  await ErrorLog.create({ 
    name: err.name, 
    message: err.message, 
    stack: err.stack 
  }).catch((logError) => {
    logger.warn({ logError }, "Failed to log error to database");
  });
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  const response: any = {
    status: 'error',
    message: env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : message
  };
  
  // Include stack trace only in development
  if (env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}
