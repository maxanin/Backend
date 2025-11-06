import { Router } from "express";
import authRoutes from "./auth.routes";
import itemsRoutes from "./items.routes";
import quotationsRoutes from "./quotations.routes";
import customersRoutes from "./customers.routes";
import invoicesRoutes from "./invoices.routes";
import adminRoutes from "./admin.routes";

const api = Router();
api.use("/auth", authRoutes);
api.use("/items", itemsRoutes);
api.use("/quotations", quotationsRoutes);
api.use("/customers", customersRoutes);
api.use("/invoices", invoicesRoutes);
api.use("/admin", adminRoutes);
export default api;
