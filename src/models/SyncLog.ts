import { Schema, model } from "mongoose";
const SyncLogSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, index: true, required: true },
  scope: { type: String, enum: ["items","inventories","priceNotes","customers","quotations"], required: true },
  startedAt: Date,
  finishedAt: Date,
  status: { type: String, enum: ["ok","error"], default: "ok" },
  details: Schema.Types.Mixed,
  error: Schema.Types.Mixed
}, { timestamps: true });
export default model("SyncLog", SyncLogSchema);
