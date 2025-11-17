import { Neo4jGraphQL } from "@neo4j/graphql";
import { driver } from './neo4j.js';

export const typeDefs = `#graphql
    type Movie @node {
        Ids: ID!
        Title: String
        Description: String
        Year: Int
        Runtime: Int
        Rating: Float
        Votes: Int
        Revenue: Float

        # Relationships
        actor: [Actor!]! @relationship(type: "ACTED_IN", direction: IN)
        director: [Director!]! @relationship(type: "DIRECTED", direction: IN)
        genre: [Genre!]! @relationship(type: "IN", direction: OUT)
    }

    type Actor @node {
        Actors: String!
    }

    type Director @node {
        Director: String!
    }

    type Genre @node {
        Genre: String!
    }
`;


export const neoSchema = new Neo4jGraphQL({ typeDefs, driver });