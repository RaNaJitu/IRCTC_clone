import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
  });
});