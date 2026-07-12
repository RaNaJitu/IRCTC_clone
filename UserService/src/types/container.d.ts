import "fastify";
import { Container } from "../container/container";

declare module "fastify" {
  interface FastifyInstance {
    container: Container;
  }
}