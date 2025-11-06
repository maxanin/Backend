import { Router } from "express";
import { loginWithSepidar } from "../controllers/authController";
const r = Router();
r.post("/login", loginWithSepidar);
export default r;
