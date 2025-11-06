import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import SepidarService from "../services/sepidarService";

const sepidar = new SepidarService();

export async function listInvoices(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const { page = "1", limit = "20" } = req.query as any;
  const p = Math.max(parseInt(String(page)), 1);
  const l = Math.min(Math.max(parseInt(String(limit)), 1), 100);
  const [items, total] = await Promise.all([
    Invoice.find({ tenantId }).skip((p - 1) * l).limit(l).lean(),
    Invoice.countDocuments({ tenantId })
  ]);
  res.json({ items, page: p, limit: l, total });
}

export async function getInvoice(req: Request, res: Response) {
  const { tenantId } = (req as any).auth;
  const id = parseInt(req.params.id, 10);
  const invoice = await Invoice.findOne({ tenantId, invoiceId: id }).lean();
  if (!invoice) return res.status(404).json({ message: "Not found" });
  res.json(invoice);
}

export async function createInvoice(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const created = await sepidar.createInvoice(tenantId, integrationId, token, req.body);
  res.status(201).json(created);
}

export async function createInvoiceBasedOnQuotation(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = (await (await import("../models/User")).default.findById(userId))?.lastSepidarToken;
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const quotationId = parseInt(req.params.quotationId, 10);
  const created = await sepidar.createInvoiceBasedOnQuotation(tenantId, integrationId, token, quotationId);
  res.status(201).json(created);
}
