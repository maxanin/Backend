import { Router } from "express";
import { auth } from "../middlewares/auth";
import { deviceLimit } from "../middlewares/deviceLimit";
import { listCustomers, getCustomer, syncCustomers } from "../controllers/customersController";

const r = Router();
r.get("/", auth, deviceLimit, listCustomers);
r.get("/:id", auth, deviceLimit, getCustomer);
r.post("/sync", auth, syncCustomers);

export default r;
