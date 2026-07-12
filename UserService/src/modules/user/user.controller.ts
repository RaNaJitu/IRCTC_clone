import { FastifyReply, FastifyRequest } from "fastify";
import { getUsers } from "./user.service";

export const allUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const users = await getUsers();

  reply.send(users);
};