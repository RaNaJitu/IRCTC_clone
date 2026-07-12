import Fastify from "fastify";

import corsPlugin from "./plugins/cors";
import jwtPlugin from "./plugins/jwt";
import swaggerPlugin from "./plugins/swagger";

import { registerErrorHandler } from "./plugins/error-handler";

import healthRoute from "./modules/health/health.routes";
import { env } from "./configs/env";
import routes from "./routes";
import containerPlugin from "./plugins/container";
import cookie from "@fastify/cookie";


const app = Fastify({
  // logger: true,
  // logger: {
  //   level: "info",
  //   transport:
  //     process.env.NODE_ENV !== "production"
  //       ? {
  //           target: "pino-pretty",
  //         }
  //       : undefined,
  // },
  logger: {
    level: "info",
    ...(env.NODE_ENV !== "production"
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        }
      : {}),
  },
});

async function buildServer() {
  await app.register(corsPlugin);
  await app.register(cookie);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);
  await app.register(containerPlugin);
  await app.register(routes);
  await registerErrorHandler(app);

  await app.register(healthRoute);


  return app;
}

export default buildServer;