const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
  },
  Mutation: {
    createPost: async (_, { title, content, userId }) => {
      return await prisma.post.create({
        data: {
          title,
          content,
          userId: Number(userId), // Ensure userId is stored as a number
        },
      });
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

  Subscription: {
    postCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("POST_CREATED"),
    },
    postUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("POST_UPDATED"),
    },
    postDeleted: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("POST_DELETED"),
    },
  },
};

module.exports = resolvers;