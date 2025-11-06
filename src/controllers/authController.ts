import { Request, Response } from "express";
import User from "../models/User";
import SepidarService from "../services/sepidarService";
import { signAppJwt } from "../utils/jwt";

const sepidar = new SepidarService();

export async function loginWithSepidar(req: Request, res: Response) {
  const { username, password, tenantId, integrationId } = req.body as {
    username: string; password: string; tenantId: string; integrationId: number;
  };

  // 1) لاگین سپیدار → Token
  const login = await sepidar.login(tenantId, integrationId, username, password);

  // 2) مَپ کاربر ما
  let user = await User.findOne({ tenantId, username });
  if (!user) user = await User.create({ tenantId, username, role: "customer", isActive: true, devices: [], maxDevices: 2 });

  user.lastSepidarToken = login.Token;
  user.lastSepidarTokenExp = new Date(Date.now() + 1000 * 60 * 55); // فرض: 55 دقیقه
  await user.save();

  // 3) JWT اپ
  const appToken = await signAppJwt({ userId: user._id, tenantId, integrationId }, "7d");
  res.json({ token: appToken, user: { id: user._id, username, role: user.role } });
}
