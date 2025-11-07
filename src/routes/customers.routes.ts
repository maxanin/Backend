import { Router } from "express";
import { auth } from "../middlewares/auth";
import { deviceLimit } from "../middlewares/deviceLimit";
import { listCustomers, getCustomer, syncCustomers, getMyProfile, getMyInvoices } from "../controllers/customersController";

const r = Router();
r.get("/me", auth, deviceLimit, getMyProfile);
r.get("/me/invoices", auth, deviceLimit, getMyInvoices);
r.get("/", auth, deviceLimit, listCustomers);
r.get("/:id", auth, deviceLimit, getCustomer);
r.post("/sync", auth, syncCustomers);

export default r;
