// App.tsx
import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar'; // Asegúrate de que este componente existe

// Configura el enlace HTTP para tu API GraphQL
const httpLink = createHttpLink({
  uri: '/graphql', // Asegúrate de que esta URI apunte a tu servidor GraphQL
});

// Middleware para adjuntar el token JWT a cada solicitud
const authLink = setContext((_, { headers }) => {
  // Obtiene el token de autenticación del local storage
  const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
  console.log("Auth Token:", token);
  // Devuelve los headers al contexto para que httpLink pueda leerlos
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Crea el cliente Apollo
const client = new ApolloClient({
  // Configura el cliente para ejecutar el middleware authLink antes de hacer la solicitud
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </ApolloProvider>
  );
}

export default App;
