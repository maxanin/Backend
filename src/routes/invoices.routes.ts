import { Router } from "express";
import { auth } from "../middlewares/auth";
import { deviceLimit } from "../middlewares/deviceLimit";
import { listInvoices, getInvoice, createInvoice, createInvoiceBasedOnQuotation } from "../controllers/invoicesController";

const r = Router();
r.get("/", auth, deviceLimit, listInvoices);
r.get("/:id", auth, deviceLimit, getInvoice);
r.post("/", auth, deviceLimit, createInvoice);
r.post("/based-on-quotation/:quotationId", auth, deviceLimit, createInvoiceBasedOnQuotation);
export default r;
