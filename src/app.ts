import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import api from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

const app = express();
app.use(helmet());

// Configure CORS based on environment
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({ 
  origin: env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true 
}));

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use("/api", api);
app.use(errorHandler);

export default app;
