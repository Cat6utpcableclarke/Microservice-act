const amqp = require("amqplib");

// Function to generate random post data
function generateRandomPost() {
  const titles = ["First Post", "Second Post", "Third Post", "Amazing Post", "Random Thoughts"];
  const contents = [
    "This is some random content.",
    "Here are my thoughts on this topic.",
    "This is a great post about something interesting.",
    "Random content for testing purposes.",
    "Another amazing post with random data.",
  ];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomContent = contents[Math.floor(Math.random() * contents.length)];
  const randomUserId = Math.floor(Math.random() * 3) + 1; // Random userId between 1 and 3

  return {
    title: randomTitle,
    content: randomContent,
    userId: randomUserId,
  };
}

async function publishPosts() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Assert the exchange
    const exchange = "post_events";
    await channel.assertExchange(exchange, "fanout", { durable: false });

    console.log("✅ Connected to RabbitMQ. Publishing posts...");

    // Publish random posts every 2 seconds
    setInterval(() => {
      const post = generateRandomPost();
      const message = JSON.stringify({ event: "POST_CREATED", post });
      channel.publish(exchange, "", Buffer.from(message));
      console.log(`📨 Published post: ${message}`);
    }, 2000);

    // Keep the connection open indefinitely
  } catch (error) {
    console.error("❌ Error publishing posts:", error.message);
  }
}

// Start the publisher
publishPosts();