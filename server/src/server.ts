import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { fileURLToPath } from 'url';
import path from 'path';
import type { Request, Response } from 'express';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { authenticateToken } from './services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = new ApolloServer({
  typeDefs,
  resolvers
  
});

const startApolloServer = async () => {
  await server.start();
  await db();
  console.log('Database connected successfully.');

  const PORT = process.env.PORT || 3001;
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: ({ req }) => {
      return authenticateToken({ req }); 
      
       // Asegúrate de que `req` está definido aquí
    },
  }));
  

  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '../../client/dist');
    console.log('Serving static files from:', staticPath);
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
    });

  }

  app.listen(PORT, () => {  
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();









// import express from 'express';
// import path from 'node:path';
// import db from './config/connection.js';
// import routes from './routes/index.js';

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // if we're in production, serve client/build as static assets
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// app.use(routes);

// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });

