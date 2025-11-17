import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { graphql } from 'graphql';
import dotenv from 'dotenv';
import { neoSchema } from './typedefs.js';
import { driver } from './neo4j.js';
import { translateNLtoGraphQL } from './llm.js';
import { cleanedGql } from './llm.js';

dotenv.config();

async function Hono_Server() {
  const app = new Hono();
  //CORS
  app.use('/*', cors({
    origin: process.env.REQ_PORT || "", 
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  }));
  //Routes
  app.post('/gimmeSomething', async (c) => {
    try {
      const body = await c.req.json();
      const nl = body.nl;

      if (!nl || typeof nl !== 'string') {
        return c.json({ error: 'Provide { nl: "your natural language" }' }, 400);
      }

      const gql = await translateNLtoGraphQL(nl);
      const parsedgql = cleanedGql(gql);

      if (!parsedgql || typeof parsedgql !== 'string' || !parsedgql.startsWith('query') && !parsedgql.trim().startsWith('mutation')) {
        return c.json({ error: 'Invalid GraphQL returned', raw: gql }, 400);
      }

      const schema = await neoSchema.getSchema();

      const result = await graphql({
        schema,
        source: parsedgql,
        contextValue: { driver },
      });

      return c.json({ graphql: parsedgql, result }, 200);
    } catch (err) {
      console.error('NL endpoint error:', err);
      return c.json({ error: err }, 500);
    }
  });

  // Optional health check
  app.get('/', (c) => c.text('Hono server for NL → GraphQL is running'));

  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Hono server running at http://localhost:${info.port}`);
      console.log('POST /gimmeSomething { "nl": "<your natural language>" }');
    }
  );
}

async function GraphQl_Server() {
  const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 GraphQL server ready at ${url}`);
}

Hono_Server().catch((err) => {
  console.error('Failed to start Hono', err);
});

GraphQl_Server().catch((err) => {
  console.error('Failed to start GraphQL', err);
});
