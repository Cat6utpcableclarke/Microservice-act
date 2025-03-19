const { gql } = require("graphql-tag");
const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    userId: Int! # Add userId to associate posts with users
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    createPost(title: String!, content: String!, userId: ID!): Post # Include userId in createPost
    updatePost(id: ID!, title: String, content: String): Post
    deletePost(id: ID!): Post
  }

  type Subscription {
    postCreated: Post
    postUpdated: Post
    postDeleted: Post
  }
`;

module.exports = typeDefs;