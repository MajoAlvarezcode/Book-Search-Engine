const typeDefs = `
  type Book {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    saveBook(bookInput: BookInput!): User
    deleteBook(bookId: String!): User
  }

  input BookInput {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }
`;

export default typeDefs;