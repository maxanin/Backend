// models/Item.ts  (بر اساس Data Model آیتم‌ها)
import { Schema, model, Types } from "mongoose";
export interface IItem {
  tenantId: Types.ObjectId;
  itemId: number;            // ItemID
  code: string;
  barcode?: string;
  title: string;
  isActive?: boolean;
  isSellable?: boolean;
  type?: number;             // 1 کالا, 2 خدمت, 3 دارایی (فعلا کالا/خدمت) :contentReference[oaicite:5]{index=5}
  unitId?: number;
  secondaryUnitId?: number;
  unitsRatio?: number;
  weight?: number;
  volume?: number;
  isTaxExempt?: boolean;
  taxRate?: number;
  dutyRate?: number;
  saleGroupRef?: number;
  tracings?: { tracingId: number; title: string; isSelectable?: boolean }[];
  tracingInventories?: { tracingRef: number; inventory: string }[];
  totalInventory?: number;
  propertyValues?: { propertyRef: number; value: string }[];
  thumbnailBase64?: string;            // از /Items/{id}/Image   :contentReference[oaicite:6]{index=6}
  brokerSellable?: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  itemId: { type: Number, required: true },
  code: { type: String, index: true },
  barcode: String,
  title: { type: String, index: "text" },
  isActive: Boolean,
  isSellable: Boolean,
  type: Number,
  unitId: Number,
  secondaryUnitId: Number,
  unitsRatio: Number,
  weight: Number,
  volume: Number,
  isTaxExempt: Boolean,
  taxRate: Number,
  dutyRate: Number,
  saleGroupRef: Number,
  tracings: [{ tracingId: Number, title: String, isSelectable: Boolean }],
  tracingInventories: [{ tracingRef: Number, inventory: String }],
  totalInventory: Number,
  propertyValues: [{ propertyRef: Number, value: String }],
  thumbnailBase64: String,
  brokerSellable: Boolean,
  lastSyncAt: Date
}, { timestamps: true });

ItemSchema.index({ tenantId: 1, itemId: 1 }, { unique: true });
ItemSchema.index({ tenantId: 1, code: 1 });
export default model("Item", ItemSchema);
