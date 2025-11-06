import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  
  // Set up connection event handlers
  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
  
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  return mongoose.connection;
}
