import { Router } from "express";
import { auth } from "../middlewares/auth";
import { deviceLimit } from "../middlewares/deviceLimit";
import { createQuotation } from "../controllers/quotationsController";
const r = Router();
r.post("/", auth, deviceLimit, createQuotation);
export default r;
