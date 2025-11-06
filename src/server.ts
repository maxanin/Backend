import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./config/logger";

(async () => {
  await connectDB();
  app.listen(parseInt(env.PORT, 10), () => {
    logger.info(`API up on :${env.PORT}`);
  });
})();
