import { NextFunction, Request, Response } from "express";
import User from "../models/User";

export async function deviceLimit(req: Request, res: Response, next: NextFunction) {
  const { userId } = (req as any).auth || {};
  const deviceId = (req.headers["x-device-id"] as string) || "unknown";
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const exists = user.devices.find(d => d.deviceId === deviceId);
  if (!exists && user.devices.length >= (user.maxDevices ?? 2)) {
    return res.status(403).json({ message: "Device limit reached" });
  }
  if (!exists) user.devices.push({ deviceId, lastLogin: new Date() });
  else exists.lastLogin = new Date();
  await user.save();

  next();
}
