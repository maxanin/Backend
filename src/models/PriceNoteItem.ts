// models/PriceNoteItem.ts  (Fee و Marginها طبق سند) :contentReference[oaicite:8]{index=8}
import { Schema, model, Types } from "mongoose";
export interface IPriceNoteItem {
  tenantId: Types.ObjectId;
  priceNoteItemId: number;
  saleTypeRef: number;
  itemRef: number;
  tracingRef?: number;
  unitRef: number;
  fee: number;
  canChangeInvoiceFee?: boolean;
  canChangeInvoiceDiscount?: boolean;
  customerGroupingRef?: number;
  upperMargin?: number;
  lowerMargin?: number;
  additionRate?: number;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PriceNoteItemSchema = new Schema<IPriceNoteItem>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  priceNoteItemId: { type: Number, required: true },
  saleTypeRef: { type: Number, required: true },
  itemRef: { type: Number, required: true, index: true },
  tracingRef: Number,
  unitRef: { type: Number, required: true },
  fee: { type: Number, required: true },
  canChangeInvoiceFee: Boolean,
  canChangeInvoiceDiscount: Boolean,
  customerGroupingRef: Number,
  upperMargin: Number,
  lowerMargin: Number,
  additionRate: Number,
  lastSyncAt: Date
}, { timestamps: true });

PriceNoteItemSchema.index({ tenantId: 1, priceNoteItemId: 1 }, { unique: true });
PriceNoteItemSchema.index({ tenantId: 1, itemRef: 1, saleTypeRef: 1, unitRef: 1, tracingRef: 1 }, { unique: false });

export default model("PriceNoteItem", PriceNoteItemSchema);
