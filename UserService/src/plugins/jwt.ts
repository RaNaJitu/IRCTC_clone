import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { env } from "../configs/env";

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
  });
});