const amqp = require("amqplib");
const axios = require("axios");

async function startPersister() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Assert the exchange and queue
    const exchange = "post_events";
    const queue = "posts_queue";

    await channel.assertExchange(exchange, "fanout", { durable: false });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, "");

    console.log(`✅ Listening for messages on queue '${queue}'...`);

    // Consume messages from the queue
    channel.consume(
      queue,
      async (msg) => {
        if (msg.content) {
          const event = JSON.parse(msg.content.toString());
          console.log("📨 Received event:", event);

          // Handle the event
          if (event.event === "POST_CREATED") {
            console.log("Post created:", event.post);

            // Send GraphQL mutation to insert the post
            try {
              const response = await axios.post("http://localhost:4002/graphql", {
                query: `
                  mutation CreatePost($title: String!, $content: String!, $userId: ID!) {
                    createPost(title: $title, content: $content, userId: $userId) {
                      id
                      title
                      content
                      userId
                    }
                  }
                `,
                variables: {
                  title: event.post.title,
                  content: event.post.content,
                  userId: event.post.userId,
                },
              });

              console.log("✅ Post inserted into database:", response.data.data.createPost);
            } catch (error) {
              console.error("❌ Error inserting post into database:", error.message);
            }
          } else {
            console.log("Unknown event type:", event.event);
          }
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error("❌ Error in persister:", error.message);
  }
}

// Start the persister
startPersister();