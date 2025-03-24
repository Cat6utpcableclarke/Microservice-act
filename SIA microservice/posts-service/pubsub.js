const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();
console.log("✅ PubSub Initialized");

module.exports = pubsub;
