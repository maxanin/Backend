// models/User.ts
import { Schema, model, Types } from "mongoose";

export interface IUser {
  tenantId: Types.ObjectId;
  username: string;
  passwordHash?: string;         // bcrypt برای لاگین داخلی (در صورت نیاز)
  phoneNumber?: string;
  customerId?: number;           // CustomerID از سپیدار
  role: "customer" | "admin" | "sales";
  isActive: boolean;
  devices: { deviceId: string; lastLogin?: Date; fcmToken?: string }[];
  maxDevices: number;            // پیش‌فرض: 2
  lastSepidarToken?: string;     // JWT سپیدار (سرور-ساید)
  lastSepidarTokenExp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  username: { type: String, required: true, unique: true },
  passwordHash: String,
  phoneNumber: String,
  customerId: Number,
  role: { type: String, enum: ["customer", "admin", "sales"], default: "customer" },
  isActive: { type: Boolean, default: true },
  devices: [{ deviceId: String, lastLogin: Date, fcmToken: String }],
  maxDevices: { type: Number, default: 2 },
  lastSepidarToken: String,
  lastSepidarTokenExp: Date
}, { timestamps: true });

UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });

export default model("User", UserSchema);
