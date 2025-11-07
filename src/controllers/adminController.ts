import { Request, Response } from "express";
import SepidarService from "../services/sepidarService";
import SyncService from "../services/syncService";
import Device from "../models/Device";
import { provisionCustomerUsers } from "../services/customerProvision";
import { resolveServiceToken } from "../services/serviceSession";

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
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const [items, inv, price, customers, invoices, quotations] = await Promise.all([
    syncService.syncItems(tenantId, integrationId, token),
    syncService.syncInventories(tenantId, integrationId, token),
    syncService.syncPriceNotes(tenantId, integrationId, token),
    syncService.syncCustomers(tenantId, integrationId, token),
    syncService.syncInvoices(tenantId, integrationId, token),
    syncService.syncQuotations(tenantId, integrationId, token)
  ]);
  await provisionCustomerUsers(tenantId, integrationId, customers.customers ?? []);
  res.json({
    ok: true,
    items: items.count,
    inventories: inv.count,
    priceNotes: price.count,
    customers: customers.count,
    invoices: invoices.count,
    quotations: quotations.count
  });
}

export async function listActivities(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const { page = "1", limit = "50" } = req.query as any;
  const p = Math.max(parseInt(String(page)), 1);
  const l = Math.min(Math.max(parseInt(String(limit)), 1), 200);
  const ActivityLog = (await import("../models/ActivityLog")).default;
  const [items, total] = await Promise.all([
    ActivityLog.find({ tenantId }).sort({ timestamp: -1 }).skip((p - 1) * l).limit(l).lean(),
    ActivityLog.countDocuments({ tenantId })
  ]);
  res.json({ items, page: p, limit: l, total });
}

// resolve handled by serviceSession
