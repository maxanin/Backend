// models/Quotation.ts  (ساختار پیش‌فاکتور)  
import { Schema, model, Types } from "mongoose";
export interface IQuotation {
  tenantId: Types.ObjectId;
  id: number;            // ID در سپیدار
  guid: string;
  number: number;
  date: string;
  currencyRef: number;
  customerRef: number;
  addressRef?: number;
  saleTypeRef: number;
  discountOnCustomer?: number;
  price: number;
  discount?: number;
  tax?: number;
  duty?: number;
  addition?: number;
  netPrice: number;
  items: {
    quotationItemId?: number;
    rowId: number;
    itemRef: number;
    tracingRef?: number;
    stockRef?: number;
    quantity: number;
    secondaryQuantity?: number;
    fee: number;
    price: number;
    description?: string;
    priceInfoPercentDiscount?: number;
    priceInfoPriceDiscount?: number;
    priceInfoDiscountRate?: number;
    aggregateAmountPercentDiscount?: number;
    aggregateAmountPriceDiscount?: number;
    aggregateAmountDiscountRate?: number;
    customerDiscount?: number;
    customerDiscountRate?: number;
    discount?: number;
    discountParentRef?: number;
    tax?: number;
    duty?: number;
    addition?: number;
    netPrice: number;
  }[];
  status?: "pending" | "submitted" | "approved" | "converted_to_invoice";
  syncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema({
  quotationItemId: Number,
  rowId: { type: Number, required: true },
  itemRef: { type: Number, required: true },
  tracingRef: Number,
  stockRef: Number,
  quantity: { type: Number, required: true },
  secondaryQuantity: Number,
  fee: { type: Number, required: true },
  price: { type: Number, required: true },
  description: String,
  priceInfoPercentDiscount: Number,
  priceInfoPriceDiscount: Number,
  priceInfoDiscountRate: Number,
  aggregateAmountPercentDiscount: Number,
  aggregateAmountPriceDiscount: Number,
  aggregateAmountDiscountRate: Number,
  customerDiscount: Number,
  customerDiscountRate: Number,
  discount: Number,
  discountParentRef: Number,
  tax: Number,
  duty: Number,
  addition: Number,
  netPrice: { type: Number, required: true }
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  id: { type: Number, required: true },
  guid: { type: String, index: true },
  number: { type: Number, index: true },
  date: { type: String, required: true },
  currencyRef: { type: Number, required: true },
  customerRef: { type: Number, required: true },
  addressRef: Number,
  saleTypeRef: { type: Number, required: true },
  discountOnCustomer: Number,
  price: { type: Number, required: true },
  discount: Number,
  tax: Number,
  duty: Number,
  addition: Number,
  netPrice: { type: Number, required: true },
  items: { type: [QuotationItemSchema], default: [] },
  status: { type: String, enum: ["pending","submitted","approved","converted_to_invoice"] },
  syncedAt: Date
}, { timestamps: true });

QuotationSchema.index({ tenantId: 1, id: 1 }, { unique: true });

export default model("Quotation", QuotationSchema);
