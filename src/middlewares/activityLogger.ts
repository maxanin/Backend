import { NextFunction, Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";

export function activityLogger(action: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { userId, tenantId } = (req as any).auth || {};
      await ActivityLog.create({ tenantId, userId, action, metadata: { method: req.method, path: req.originalUrl, body: req.body } });
    } catch {}
    next();
  };
}
