import { FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return {
      success: true,
      service: "User Service",
      status: "Running",
    };
  });
};

export default healthRoute;