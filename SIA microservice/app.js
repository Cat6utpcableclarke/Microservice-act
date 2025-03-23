const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 4000;

// Serve static files (frontend)
app.use(express.static("public"));

// Endpoint to fetch posts per user
app.get("/api/posts-per-user", async (req, res) => {
  try {
    // Fetch users from users-service
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

    // Fetch posts from posts-service
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
console.log("Users Response:", JSON.stringify(usersResponse.data, null, 2));
console.log("Posts Response:", JSON.stringify(postsResponse.data, null, 2));
    // Combine users and posts
    const postsPerUser = users.map((user) => ({
      ...user,
      posts: posts.filter((post) => post.userId === Number(user.id)),
    }));

    res.json(postsPerUser);
  } catch (error) {
    console.error("Error fetching data:", error.message);

    // Log additional error details if available
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});