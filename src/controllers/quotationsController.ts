import { Request, Response } from "express";
import SepidarService from "../services/sepidarService";
import Quotation from "../models/Quotation";
import SyncService from "../services/syncService";
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
  const created = await sepidar.createQuotation(tenantId, integrationId, token, body);

  // کش محلی
  await Quotation.findOneAndUpdate(
    { tenantId, id: created.ID ?? created.Id ?? created.id },
    { ...created, tenantId },
    { upsert: true, new: true }
  );

  await syncService.syncQuotations(tenantId, integrationId, token);

  res.status(201).json(created);
}

// token resolved via serviceSession
