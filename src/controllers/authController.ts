import { Request, Response } from "express";
import crypto from "crypto";
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
  if (!user) {
    user = await User.create({ tenantId, username, role: "admin", isActive: true, devices: [], maxDevices: 2, integrationId });
  }

  user.role = "admin";
  user.integrationId = integrationId;

  user.lastSepidarToken = login.Token;
  user.lastSepidarTokenExp = new Date(Date.now() + 1000 * 60 * 55); // فرض: 55 دقیقه
  await user.save();

  // 3) JWT اپ
  const appToken = await signAppJwt({
    userId: user._id,
    tenantId,
    integrationId,
    role: user.role,
    customerId: user.customerId
  }, "7d");
  res.json({ token: appToken, user: { id: user._id, username, role: user.role } });
}

export async function customerLogin(req: Request, res: Response) {
  const { username, password, tenantId } = req.body as { username: string; password: string; tenantId: string };
  const user = await User.findOne({ tenantId, username, role: "customer", isActive: true });
  if (!user?.passwordHash) return res.status(401).json({ message: "Invalid credentials" });
  const bcrypt = await import("bcryptjs");
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  // پیدا کردن integrationId از دستگاه ثبت شده
  const integrationId = user.integrationId ?? (await (await import("../models/Device")).default.findOne({ tenantId }).lean())?.integrationId;
  if (!integrationId) return res.status(400).json({ message: "Integration not configured" });

  const appToken = await signAppJwt({
    userId: user._id,
    tenantId,
    integrationId,
    role: user.role,
    customerId: user.customerId
  }, "7d");

  res.json({ token: appToken, user: { id: user._id, username: user.username, role: user.role, customerId: user.customerId } });
}
