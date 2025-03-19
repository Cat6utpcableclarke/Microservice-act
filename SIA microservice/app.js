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
    const usersResponse = await axios.get("http://localhost:4001/");
    const users = usersResponse.data.data.users;

    // Fetch posts from posts-service
    const postsResponse = await axios.get("http://localhost:4002/");
    const posts = postsResponse.data.data.posts;

    // Combine users and posts
    const postsPerUser = users.map((user) => ({
      ...user,
      posts: posts.filter((post) => post.userId === user.id),
    }));

    res.json(postsPerUser);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});