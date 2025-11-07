import bcrypt from "bcryptjs";
import { env } from "../config/env";
import User from "../models/User";
import SepidarService from "./sepidarService";

const sepidar = new SepidarService();

export async function ensureServiceToken(tenantId: string, integrationId: number): Promise<string> {
  const username = env.SEPIDAR_SERVICE_USERNAME;
  const password = env.SEPIDAR_SERVICE_PASSWORD;
  if (!username || !password) throw new Error("Service credentials not configured");

  let user = await User.findOne({ tenantId, username, role: "service" });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({
      tenantId,
      username,
      passwordHash,
      role: "service",
      isActive: true,
      devices: [],
      maxDevices: 10,
      integrationId
    });
  }

  if (user.lastSepidarToken && user.lastSepidarTokenExp && user.lastSepidarTokenExp > new Date(Date.now() + 5 * 60 * 1000)) {
    return user.lastSepidarToken;
  }

  const login = await sepidar.login(tenantId, integrationId, username, password);
  user.lastSepidarToken = login.Token;
  user.lastSepidarTokenExp = new Date(Date.now() + 55 * 60 * 1000);
  user.integrationId = integrationId;
  await user.save();
  return login.Token;
}

export async function resolveServiceToken(tenantId: string, integrationId: number, userId?: string): Promise<string> {
  if (userId) {
    const current = await User.findById(userId);
    if (current?.lastSepidarToken && (!current.lastSepidarTokenExp || current.lastSepidarTokenExp > new Date())) {
      return current.lastSepidarToken;
    }
  }
  return ensureServiceToken(tenantId, integrationId);
}

