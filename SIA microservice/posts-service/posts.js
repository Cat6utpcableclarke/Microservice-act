const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");


async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 },
  });

  console.log(`🚀 Posts service running at ${url}`);
}

startServer();
