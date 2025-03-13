const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
  },
  Mutation: {
    createPost: async (_, args) => {
      return await prisma.post.create({ data: args });
    },
    updatePost: async (_, { id, ...data }) => {
      return await prisma.post.update({
        where: { id: Number(id) },
        data,
      });
    },
    deletePost: async (_, { id }) => {
      return await prisma.post.delete({ where: { id: Number(id) } });
    },
  },
};

module.exports = resolvers;

