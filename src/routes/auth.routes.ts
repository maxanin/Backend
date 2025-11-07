import { Router } from "express";
import { loginWithSepidar, customerLogin } from "../controllers/authController";
const r = Router();
r.post("/login", loginWithSepidar);
r.post("/customer-login", customerLogin);
export default r;
