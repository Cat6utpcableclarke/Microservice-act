const { ApolloServer } = require("@apollo/server");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { expressMiddleware } = require("@apollo/server/express4");

const typeDefs = require("./graphql/typedefs");
const resolvers = require("./graphql/resolvers");
const pubsub = require("./pubsub");

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  context: { pubsub },
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);

// WebSocket Server for Subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,
    onConnect: () => console.log("✅ WebSocket Client Connected"),
    onDisconnect: () => console.log("❌ WebSocket Client Disconnected"),
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

async function startServer() {
  await server.start();
  app.use("/graphql", expressMiddleware(server));

  httpServer.listen(4002, () => {
    console.log(`🚀 Posts service running at http://localhost:4002/graphql`);
    console.log(`📡 Subscriptions ready at ws://localhost:4002/graphql`);
  });
}

startServer();