// models/Invoice.ts  (فاکتور فروش) :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13}
import { Schema, model, Types } from "mongoose";
export interface IInvoice {
  tenantId: Types.ObjectId;
  invoiceId: number;
  orderRef?: number;
  quotationRef?: number;
  number: number;
  date: string;
  customerRef: number;
  currencyRef: number;
  rate?: number;
  saleTypeRef: number;
  addressRef?: number;
  price: number;
  tax?: number;
  duty?: number;
  discount?: number;
  addition?: number;
  netPrice?: number;
  invoiceItems: {
    invoiceItemId?: number;
    itemRef: number;
    tracingRef?: number;
    tracingTitle?: string;
    quantity: number;
    secondaryQuantity?: number;
    fee: number;
    price: number;
    discount?: number;
    tax?: number;
    duty?: number;
    addition?: number;
    netPrice?: number;
    discountInvoiceItemRef?: number;
    productPackRef?: number;
    productPackQuantity?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema({
  invoiceItemId: Number,
  itemRef: { type: Number, required: true },
  tracingRef: Number,
  tracingTitle: String,
  quantity: { type: Number, required: true },
  secondaryQuantity: Number,
  fee: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: Number,
  tax: Number,
  duty: Number,
  addition: Number,
  netPrice: Number,
  discountInvoiceItemRef: Number,
  productPackRef: Number,
  productPackQuantity: Number
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  invoiceId: { type: Number, required: true },
  orderRef: Number,
  quotationRef: Number,
  number: { type: Number, index: true },
  date: { type: String, required: true },
  customerRef: { type: Number, required: true },
  currencyRef: { type: Number, required: true },
  rate: Number,
  saleTypeRef: { type: Number, required: true },
  addressRef: Number,
  price: { type: Number, required: true },
  tax: Number,
  duty: Number,
  discount: Number,
  addition: Number,
  netPrice: Number,
  invoiceItems: { type: [InvoiceItemSchema], default: [] }
}, { timestamps: true });

InvoiceSchema.index({ tenantId: 1, invoiceId: 1 }, { unique: true });

export default model("Invoice", InvoiceSchema);
