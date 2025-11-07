import { Router } from "express";
import { auth } from "../middlewares/auth";
import { registerDevice, triggerFullSync, listActivities } from "../controllers/adminController";

const r = Router();
r.post("/devices/register", auth, registerDevice);
r.post("/sync/full", auth, triggerFullSync);
r.get("/activities", auth, listActivities);
export default r;
