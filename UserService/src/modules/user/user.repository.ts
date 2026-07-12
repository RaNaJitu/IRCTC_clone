import { LOGGER } from "../../configs/logger";
import { prisma } from "../../configs/prisma";

export class UserRepository {
  async findByEmail(email: string) {
    LOGGER.info("Finding user by email:", email);
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return prisma.user.create({
      data,
    });
  }


  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }


  

}
