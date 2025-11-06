import { Router } from "express";
import { auth } from "../middlewares/auth";
import { deviceLimit } from "../middlewares/deviceLimit";
import { listItems, refreshItemsFromSepidar } from "../controllers/itemsController";
const r = Router();
r.get("/", auth, deviceLimit, listItems);
r.post("/sync", auth, refreshItemsFromSepidar);
export default r;
