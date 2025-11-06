import { Request, Response } from "express";
import SepidarService from "../services/sepidarService";
import Quotation from "../models/Quotation";
import User from "../models/User";

const sepidar = new SepidarService();

export async function createQuotation(req: Request, res: Response) {
  const { tenantId, integrationId, userId } = (req as any).auth;
  const user = await User.findById(userId);
  if (!user?.lastSepidarToken) return res.status(401).json({ message: "Sepidar token missing" });

  const body = req.body; // بدنه دقیقاً طبق مدل سپیدار
  const created = await sepidar.createQuotation(tenantId, integrationId, user.lastSepidarToken, body);

  // کش محلی
  await Quotation.findOneAndUpdate(
    { tenantId, id: created.ID ?? created.Id ?? created.id },
    { ...created, tenantId },
    { upsert: true, new: true }
  );

  res.status(201).json(created);
}
