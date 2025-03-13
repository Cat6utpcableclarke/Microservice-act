const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();



const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
  },
  Mutation: {
    createUser: async (_, args) => {
      return await prisma.user.create({ data: args });
    },
    updateUser: async (_, { id, ...data }) => {
      return await prisma.user.update({
        where: { id: Number(id) },
        data,
      });
    },
    deleteUser: async (_, { id }) => {
      return await prisma.user.delete({ where: { id: Number(id) } });
    },
  },
};

module.exports = resolvers;