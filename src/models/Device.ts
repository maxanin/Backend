// models/Device.ts
import { Schema, model, Types } from "mongoose";
export interface IDevice {
  tenantId: Types.ObjectId;
  title?: string;
  serial: string;                  // سریال تولید شده داخل سپیدار
  integrationId: number;           // 4 رقم سمت چپ سریال طبق داک
  publicKeyXml: string;            // <RSAKeyValue>...</RSAKeyValue>
  cypherFromServer?: string;       // Base64
  ivFromServer?: string;           // Base64
  isRegistered: boolean;
  generationVersion: string;       // معمولا "101"
  lockNumber?: string;             // از General/GenerationVersion
  lastRegisteredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: String,
  serial: { type: String, required: true },
  integrationId: { type: Number, required: true },
  publicKeyXml: { type: String, required: true },
  cypherFromServer: String,
  ivFromServer: String,
  isRegistered: { type: Boolean, default: false },
  generationVersion: { type: String, default: "101" },
  lockNumber: String,
  lastRegisteredAt: Date
}, { timestamps: true });

DeviceSchema.index({ tenantId: 1, integrationId: 1 }, { unique: true });
export default model("Device", DeviceSchema);
