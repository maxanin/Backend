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

// Configure CORS with explicit origin validation
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost origins
    if (env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true 
}));

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use("/api", api);
app.use(errorHandler);

export default app;
