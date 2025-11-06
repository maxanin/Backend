import { NextFunction, Request, Response } from "express";
import { verifyAppJwt } from "../utils/jwt";

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = hdr.slice(7);
    const payload = await verifyAppJwt(token);
    (req as any).auth = payload; // شامل tenantId, userId, integrationId
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
