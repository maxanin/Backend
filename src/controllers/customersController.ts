import { Request, Response } from "express";
import Customer from "../models/Customer";
import SyncService from "../services/syncService";
import SepidarService from "../services/sepidarService";

const sepidar = new SepidarService();
const syncService = new SyncService(sepidar);

export async function listCustomers(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const { q, page = "1", limit = "20" } = req.query as any;
  const filter: any = { tenantId };
  if (q) filter.$or = [{ title: new RegExp(String(q), "i") }, { code: new RegExp(String(q), "i") }];
  const p = Math.max(parseInt(String(page)), 1);
  const l = Math.min(Math.max(parseInt(String(limit)), 1), 100);
  const [items, total] = await Promise.all([
    Customer.find(filter).skip((p - 1) * l).limit(l).lean(),
    Customer.countDocuments(filter)
  ]);
  res.json({ items, page: p, limit: l, total });
}

export async function getCustomer(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const id = parseInt(req.params.id, 10);
  const cached = await Customer.findOne({ tenantId, customerId: id }).lean();
  if (cached) return res.json(cached);
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const detail = await sepidar.getCustomerById(tenantId, integrationId, token, id);
  res.json(detail);
}

export async function syncCustomers(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const result = await syncService.syncCustomers(tenantId, integrationId, token);
  res.json({ ok: true, synced: result.count });
}
