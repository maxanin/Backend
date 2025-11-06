// models/Customer.ts  (طبق Customers) :contentReference[oaicite:9]{index=9}
import { Schema, model, Types } from "mongoose";
export interface ICustomer {
  tenantId: Types.ObjectId;
  customerId: number;
  guid: string;
  title: string;
  code: string;
  phoneNumber?: string;
  remainder?: number;
  creditRemainder?: number;
  customerType?: number; // 1 حقیقی / 2 حقوقی
  name?: string;
  lastName?: string;
  birthDate?: string;     // ISO 8601
  nationalId?: string;
  economicCode?: string;
  version?: number;
  groupingRef?: number;
  discountRate?: number;
  addresses?: {
    customerAddressId?: number;
    guid: string;
    title?: string;
    isMain: boolean;
    cityRef?: number;
    address?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  }[];
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema({
  customerAddressId: Number,
  guid: { type: String, index: true },
  title: String,
  isMain: { type: Boolean, default: false },
  cityRef: Number,
  address: String,
  zipCode: String,
  latitude: Number,
  longitude: Number
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  customerId: { type: Number, required: true },
  guid: { type: String, index: true },
  title: { type: String, required: true, index: true },
  code: { type: String, index: true },
  phoneNumber: String,
  remainder: Number,
  creditRemainder: Number,
  customerType: Number,
  name: String,
  lastName: String,
  birthDate: String,
  nationalId: String,
  economicCode: String,
  version: Number,
  groupingRef: Number,
  discountRate: Number,
  addresses: { type: [CustomerAddressSchema], default: [] },
  lastSyncAt: Date
}, { timestamps: true });

CustomerSchema.index({ tenantId: 1, customerId: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, code: 1 });

export default model("Customer", CustomerSchema);
