import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import ErrorLog from "../models/ErrorLog";

export async function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, "Unhandled error");
  await ErrorLog.create({ name: err.name, message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
}
