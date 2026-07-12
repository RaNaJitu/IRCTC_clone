import { FastifyInstance } from "fastify";
import Autoload from "@fastify/autoload";
import path from "path";

import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";

export default async function routes(app: FastifyInstance) {

    // app.register(Autoload, {
    //     dir: path.join(__dirname, "modules"),
    //     options: { prefix: "/api/v1" },
    // });
  app.register(authRoutes, {
    prefix: "/api/v1/auth",
  });

  app.register(userRoutes, {
    prefix: "/api/v1/users",
  });
}