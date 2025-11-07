export async function shareQuotationLink(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const id = parseInt(req.params.id, 10);
  const channel = String(req.query.channel || "whatsapp");
  const qt = await Quotation.findOne({ tenantId, id }).lean();
  if (!qt) return res.status(404).json({ message: "Not found" });
  const text = encodeURIComponent(`پیشفاکتور شماره ${qt.number} مبلغ ${qt.netPrice}\nتاریخ: ${qt.date}`);
  let url = "";
  if (channel === "telegram") url = `https://t.me/share/url?url=&text=${text}`;
  else if (channel === "whatsapp") url = `https://wa.me/?text=${text}`;
  else url = `sms:?body=${text}`;
  res.json({ url });
}
import { Request, Response } from "express";
import SepidarService from "../services/sepidarService";
import Quotation from "../models/Quotation";
import SyncService from "../services/syncService";
import { notify } from "../services/notificationService";
import { resolveServiceToken } from "../services/serviceSession";

const sepidar = new SepidarService();
const syncService = new SyncService(sepidar);

export async function createQuotation(req: Request, res: Response) {
  const { tenantId, integrationId, userId, role, customerId } = (req as any).auth;
  if (role === "customer") {
    if (!customerId) return res.status(400).json({ message: "Customer not linked" });
    req.body.CustomerRef = customerId;
  }
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });

  const body = req.body; // بدنه دقیقاً طبق مدل سپیدار
  if (body && body.Description == null && body.description != null) {
    body.Description = String(body.description);
  }
  const created = await sepidar.createQuotation(tenantId, integrationId, token, body);

  // کش محلی
  await Quotation.findOneAndUpdate(
    { tenantId, id: created.ID ?? created.Id ?? created.id },
    { ...created, tenantId },
    { upsert: true, new: true }
  );

  await syncService.syncQuotations(tenantId, integrationId, token);
  await notify("console", {
    type: "quotation_created",
    tenantId,
    customerRef: created.CustomerRef ?? created.customerRef,
    number: created.Number ?? created.number,
    date: created.Date ?? created.date,
    amount: created.NetPrice ?? created.netPrice,
    description: body.Description
  });

  res.status(201).json(created);
}

export async function listQuotations(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const { page = "1", limit = "20", status } = req.query as any;
  const p = Math.max(parseInt(String(page)), 1);
  const l = Math.min(Math.max(parseInt(String(limit)), 1), 100);
  const filter: any = { tenantId };
  if (status) filter.status = String(status);
  const [items, total] = await Promise.all([
    Quotation.find(filter).skip((p - 1) * l).limit(l).lean(),
    Quotation.countDocuments(filter)
  ]);
  res.json({ items, page: p, limit: l, total });
}

export async function getQuotationById(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const id = parseInt(req.params.id, 10);
  const qt = await Quotation.findOne({ tenantId, id }).lean();
  if (!qt) return res.status(404).json({ message: "Not found" });
  res.json(qt);
}

export async function getMyQuotations(req: Request, res: Response) {
  const { tenantId, role, customerId } = (req as any).auth;
  if (role !== "customer") return res.status(403).json({ message: "Only customers" });
  const list = await Quotation.find({ tenantId, customerRef: customerId }).sort({ date: -1 }).lean();
  res.json({ items: list });
}

// token resolved via serviceSession
