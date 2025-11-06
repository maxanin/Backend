import { Schema, model, Types } from "mongoose";
const ActivityLogSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, index: true, required: true },
  userId: { type: Schema.Types.ObjectId, index: true },
  action: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});
export default model("ActivityLog", ActivityLogSchema);
