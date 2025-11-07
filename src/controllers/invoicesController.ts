import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import SepidarService from "../services/sepidarService";
import SyncService from "../services/syncService";
import { resolveServiceToken } from "../services/serviceSession";
import { notify } from "../services/notificationService";

const sepidar = new SepidarService();
const syncService = new SyncService(sepidar);

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
  const { tenantId, integrationId, userId, role, customerId } = (req as any).auth;
  if (role === "customer") {
    if (!customerId) return res.status(400).json({ message: "Customer not linked" });
    req.body.CustomerRef = customerId;
  }
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  // پشتیبانی از توضیحات مشتری در بدنه
  if (req.body && req.body.Description == null && req.body.description != null) {
    req.body.Description = String(req.body.description);
  }
  const created = await sepidar.createInvoice(tenantId, integrationId, token, req.body);
  await upsertInvoice(tenantId, created);
  await notify("console", {
    type: "invoice_created",
    tenantId,
    customerRef: created.CustomerRef ?? created.customerRef,
    number: created.Number ?? created.number,
    date: created.Date ?? created.date,
    amount: created.NetPrice ?? created.netPrice,
    description: req.body.Description
  });
  res.status(201).json(created);
}

export async function createInvoiceBasedOnQuotation(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const token = await resolveServiceToken(tenantId, integrationId, userId);
  if (!token) return res.status(401).json({ message: "Sepidar token missing" });
  const quotationId = parseInt(req.params.quotationId, 10);
  const created = await sepidar.createInvoiceBasedOnQuotation(tenantId, integrationId, token, quotationId);
  await syncService.syncInvoices(tenantId, integrationId, token);
  res.status(201).json(created);
}

async function upsertInvoice(tenantId: string, payload: any) {
  const invoiceId = payload.Id ?? payload.ID ?? payload.InvoiceId ?? payload.id;
  if (!invoiceId) return;
  await Invoice.findOneAndUpdate(
    { tenantId, invoiceId },
    {
      tenantId,
      invoiceId,
      orderRef: payload.OrderRef,
      quotationRef: payload.QuotationRef ?? payload.QuatationRef,
      number: payload.Number,
      date: payload.Date,
      customerRef: payload.CustomerRef,
      currencyRef: payload.CurrencyRef,
      rate: payload.Rate,
      saleTypeRef: payload.SaleTypeRef,
      addressRef: payload.AddressRef,
      price: payload.Price,
      tax: payload.Tax,
      duty: payload.Duty,
      discount: payload.Discount,
      addition: payload.Addition,
      netPrice: payload.NetPrice,
      invoiceItems: payload.InvoiceItems,
      lastSyncAt: new Date()
    },
    { upsert: true, new: true }
  );
}
