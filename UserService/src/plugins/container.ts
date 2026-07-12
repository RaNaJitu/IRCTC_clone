import fp from "fastify-plugin";
import { Container } from "../container/container";

export default fp(async (fastify) => {
  const container = new Container(fastify);

  fastify.decorate("container", container);
});