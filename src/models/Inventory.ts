// models/Inventory.ts  (از /Items/Inventories پر می‌شود) :contentReference[oaicite:7]{index=7}
import { Schema, model, Types } from "mongoose";
export interface IInventory {
  tenantId: Types.ObjectId;
  itemRef: number;
  tracingRef?: number;
  stockRef: number;
  quantity: number;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const InventorySchema = new Schema<IInventory>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  itemRef: { type: Number, required: true, index: true },
  tracingRef: Number,
  stockRef: { type: Number, required: true, index: true },
  quantity: { type: Number, required: true },
  lastSyncAt: Date
}, { timestamps: true });

InventorySchema.index({ tenantId: 1, itemRef: 1, stockRef: 1, tracingRef: 1 }, { unique: true });
export default model("Inventory", InventorySchema);
