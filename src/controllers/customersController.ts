import { Request, Response } from "express";
import Customer from "../models/Customer";
import Invoice from "../models/Invoice";
import SyncService from "../services/syncService";
import SepidarService from "../services/sepidarService";
import { provisionCustomerUsers } from "../services/customerProvision";
import { resolveServiceToken } from "../services/serviceSession";

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
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const detail = await sepidar.getCustomerById(tenantId, integrationId, token, id);
  res.json(detail);
}

export async function syncCustomers(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const result = await syncService.syncCustomers(tenantId, integrationId, token);
  await provisionCustomerUsers(tenantId, integrationId, result.customers ?? []);
  res.json({ ok: true, synced: result.count });
}

export async function getMyProfile(req: Request, res: Response) {
  const { tenantId, customerId, role } = (req as any).auth;
  if (role !== "customer") return res.status(403).json({ message: "Only customers" });
  if (!customerId) return res.status(400).json({ message: "Customer id missing" });
  const customer = await Customer.findOne({ tenantId, customerId }).lean();
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json({ customer });
}

export async function getMyInvoices(req: Request, res: Response) {
  const { tenantId, customerId, role } = (req as any).auth;
  if (role !== "customer") return res.status(403).json({ message: "Only customers" });
  if (!customerId) return res.status(400).json({ message: "Customer id missing" });
  const invoices = await Invoice.find({ tenantId, customerRef: customerId }).sort({ date: -1 }).lean();
  res.json({ items: invoices });
}

// no local resolve function; using serviceSession
