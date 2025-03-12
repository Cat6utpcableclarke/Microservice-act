const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { gql } = require("graphql-tag");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): User
  }
`;

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

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
  });

  console.log(`🚀 Users service running at ${url}`);
}

startServer();
