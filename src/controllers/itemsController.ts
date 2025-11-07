import { Request, Response } from "express";
import Item from "../models/Item";
import SepidarService from "../services/sepidarService";
import SyncService from "../services/syncService";

const sepidar = new SepidarService();
const syncService = new SyncService(sepidar);

export async function listItems(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const { q, groupId, page = "1", limit = "20" } = req.query as any;

  // ابتدا از کش محلی
  const filter: any = { tenantId };
  if (q) filter.$or = [{ code: new RegExp(q, "i") }, { title: new RegExp(q, "i") }];
  if (groupId) filter.saleGroupRef = Number(groupId);

  const p = Math.max(parseInt(page), 1);
  const l = Math.min(Math.max(parseInt(limit), 1), 100);

  const [items, total] = await Promise.all([
    Item.find(filter).skip((p - 1) * l).limit(l).lean(),
    Item.countDocuments(filter)
  ]);

  res.json({ items, page: p, limit: l, total });
}

export async function refreshItemsFromSepidar(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  // توکن سپیدارِ کاربر
  // (برای سادگی از User می‌گیریم؛ می‌تونه global هم باشه)
  // Pull → upsert
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });

  const [itemsRes, invRes, priceRes] = await Promise.all([
    syncService.syncItems(tenantId, integrationId, token),
    syncService.syncInventories(tenantId, integrationId, token),
    syncService.syncPriceNotes(tenantId, integrationId, token)
  ]);

  res.json({ ok: true, items: itemsRes.count, inventories: invRes.count, priceNotes: priceRes.count });
}

export async function updateItemMetadata(req: Request, res: Response) {
  const { tenantId, role } = (req as any).auth;
  if (role !== "admin" && role !== "service") return res.status(403).json({ message: "Forbidden" });
  const itemId = parseInt(req.params.itemId, 10);
  const { title, description, thumbnailBase64 } = req.body as any;
  const update: any = {};
  if (title !== undefined) update.title = String(title);
  if (description !== undefined) update.propertyValues = [{ propertyRef: 0, value: String(description) }];
  if (thumbnailBase64 !== undefined) update.thumbnailBase64 = String(thumbnailBase64);
  const updated = await (await import("../models/Item")).default.findOneAndUpdate(
    { tenantId, itemId },
    update,
    { new: true }
  ).lean();
  res.json({ ok: true, item: updated });
}
