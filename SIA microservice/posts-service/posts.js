const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { gql } = require("graphql-tag");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    createPost(title: String!, content: String!): Post
    updatePost(id: ID!, title: String, content: String): Post
    deletePost(id: ID!): Post
  }
`;

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

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 },
  });

  console.log(`🚀 Posts service running at ${url}`);
}

startServer();
