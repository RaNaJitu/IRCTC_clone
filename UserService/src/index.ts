import buildServer from "./server";
import { env } from "./configs/env";
import { prisma } from "./configs/prisma";
import { LOGGER } from "./configs/logger";


async function start() {
  try {
    await prisma.$connect();

    LOGGER.info("Connected to PostgreSQL");

    const app = await buildServer();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    LOGGER.info(`Server running on ${env.PORT}`);
    process.on("SIGINT", async () => {
      LOGGER.info("Shutting down...");

      await prisma.$disconnect();

      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      LOGGER.info("Shutting down...");

      await prisma.$disconnect();

      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    
    process.exit(1);
  }

}

start();