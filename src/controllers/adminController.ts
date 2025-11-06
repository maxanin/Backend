import { Request, Response } from "express";
import SepidarService from "../services/sepidarService";
import SyncService from "../services/syncService";

const sepidar = new SepidarService();
const syncService = new SyncService(sepidar);

export async function registerDevice(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const { serial, integrationId } = req.body as { serial: string; integrationId?: number };
  if (!serial) return res.status(400).json({ message: "serial is required" });
  const device = await sepidar.registerDevice(tenantId, serial, integrationId);
  try {
    const gen = await sepidar.getGenerationInfo();
    device.generationVersion = gen.GenerationVersion;
    device.lockNumber = gen.LockNumber;
    await device.save();
  } catch {}
  res.status(201).json({ ok: true, deviceId: device._id, integrationId: device.integrationId });
}

export async function triggerFullSync(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const [items, inv, price, customers] = await Promise.all([
    syncService.syncItems(tenantId, integrationId, token),
    syncService.syncInventories(tenantId, integrationId, token),
    syncService.syncPriceNotes(tenantId, integrationId, token),
    syncService.syncCustomers(tenantId, integrationId, token)
  ]);
  res.json({ ok: true, items: items.count, inventories: inv.count, priceNotes: price.count, customers: customers.count });
}
