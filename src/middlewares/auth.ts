import { NextFunction, Request, Response } from "express";
import { verifyAppJwt } from "../utils/jwt";
import { logger } from "../config/logger";

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = hdr.slice(7);
    const payload = await verifyAppJwt(token);
    req.auth = payload as { userId: string; tenantId: string; integrationId: number };
    next();
  } catch (error) {
    logger.warn({ error }, "Token verification failed");
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
