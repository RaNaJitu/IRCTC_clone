import { FastifyInstance } from "fastify";
import { allUsers } from "./user.controller";
// import { verifyToken } from "../../middlewares/auth.middleware";

export default async function (
  fastify: FastifyInstance
) {
  fastify.get("/", {
    // preHandler: verifyToken,
    handler: allUsers,
  });
}