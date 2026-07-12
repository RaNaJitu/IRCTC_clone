import { FastifyInstance, FastifyError } from "fastify";
import { AppError } from "../exceptions/app-error";

export async function registerErrorHandler(
  fastify: FastifyInstance
) {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  });
}