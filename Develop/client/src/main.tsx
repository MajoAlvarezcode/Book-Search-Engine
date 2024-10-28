// main.tsx
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import { ApolloClient, InMemoryCache } from '@apollo/client'; // Importa Apollo Client

// Configura el cliente Apollo
export const client = new ApolloClient({
  uri: 'http://localhost:3001/graphql', // Asegúrate de que este URI apunte a tu servidor GraphQL
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <SearchBooks />
      },
      {
        path: '/saved',
        element: <SavedBooks />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);








// import ReactDOM from 'react-dom/client'
// import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import 'bootstrap/dist/css/bootstrap.min.css'

// import App from './App.jsx'
// import SearchBooks from './pages/SearchBooks'
// import SavedBooks from './pages/SavedBooks'

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <App />,
//     errorElement: <h1 className='display-2'>Wrong page!</h1>,
//     children: [
//       {
//         index: true,
//         element: <SearchBooks />
//       }, {
//         path: '/saved',
//         element: <SavedBooks />
//       }
//     ]
//   }
// ])

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <RouterProvider router={router} />
// )
