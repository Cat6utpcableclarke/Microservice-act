const { PrismaClient } = require("@prisma/client");
const pubsub = require("../pubsub");// ✅ Use the shared instance

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
  },

  Mutation: {
    createPost: async (_, { title, content, userId }) => {
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          userId: Number(userId),
        },
      });

      console.log("✅ Publishing POST_CREATED event:", newPost);
      pubsub.publish("POST_CREATED", { postCreated: newPost });

      return newPost;
    },

    updatePost: async (_, { id, ...data }) => {
      const updatedPost = await prisma.post.update({
        where: { id: Number(id) },
        data,
      });

      console.log("✅ Publishing POST_UPDATED event:", updatedPost);
      pubsub.publish("POST_UPDATED", { postUpdated: updatedPost });

      return updatedPost;
    },

    deletePost: async (_, { id }) => {
      const deletedPost = await prisma.post.delete({ where: { id: Number(id) } });

      console.log("✅ Publishing POST_DELETED event:", deletedPost);
      pubsub.publish("POST_DELETED", { postDeleted: deletedPost });

      return deletedPost;
    },
  },

  Subscription: {
    postCreated: {
      subscribe: () => {
        console.log("✅ Subscribing to POST_CREATED event...");
        return pubsub.asyncIterableIterator(["POST_CREATED"]);
      },
    },
    postUpdated: {
      subscribe: () => {
        console.log("✅ Subscribing to POST_UPDATED event...");
        return pubsub.asyncIterableIterator(["POST_UPDATED"]);
      },
    },
    postDeleted: {
      subscribe: () => {
        console.log("✅ Subscribing to POST_DELETED event...");
        return pubsub.asyncIterableIterator(["POST_DELETED"]);
      },
    },
  },
};

module.exports = resolvers;
