const express = require("express");
const axios = require("axios");
const { WebSocketServer } = require("ws");

const app = express();
const PORT = 4000;

// Serve static files
app.use(express.static("public"));

// In-memory storage for WebSocket clients
const clients = new Set();

// WebSocket Server
const wss = new WebSocketServer({ port: 4003 });

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

// Fetch Posts and Users
app.get("/api/posts-per-user", async (req, res) => {
  try {
    const usersResponse = await axios.post("http://localhost:4001/graphql", {
      query: `
        query {
          users {
            id
            name
            email
          }
        }
      `,
    });

    const users = usersResponse.data.data.users;

    const postsResponse = await axios.post("http://localhost:4002/graphql", {
      query: `
        query {
          posts {
            id
            title
            content
            userId
          }
        }
      `,
    });

    const posts = postsResponse.data.data.posts;

    const postsPerUser = users.map((user) => ({
      ...user,
      posts: posts.filter((post) => post.userId === Number(user.id)),
    }));

    res.json(postsPerUser);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// WebSocket Client for GraphQL Subscription
const { createClient } = require("graphql-ws");

const graphqlClient = createClient({
  url: "ws://localhost:4002/graphql",
  retryAttempts: 5,
});

graphqlClient.subscribe(
  {
    query: `
      subscription {
        postCreated {
          id
          title
          content
          userId
        }
      }
    `,
  },
  {
    next: (message) => {
      console.log("New post received:", message);

      // Broadcast to all WebSocket clients
      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(message.data.postCreated));
        }
      });
    },
    error: (err) => console.error("Subscription Error:", err),
    complete: () => console.log("Subscription Complete"),
  }
);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
