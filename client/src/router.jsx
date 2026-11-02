import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import { NotFoundPage, RouteError } from './pages/NotFoundPage.jsx';
import PantryPage from './pages/PantryPage.jsx';
import RecipePage from './pages/RecipePage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';

// Which page to show for which address. Pages are drawn inside <Layout>, at its <Outlet />.
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        // A route without a path groups the pages under one error page. Because it sits
        // inside the layout, a crashing page still keeps the header and footer.
        errorElement: <RouteError />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/recipes', element: <RecipesPage /> },
          { path: '/recipes/:slug', element: <RecipePage /> }, // :slug = any recipe's slug
          { path: '/pantry', element: <PantryPage /> },
          { path: '*', element: <NotFoundPage /> }, // anything else
        ],
      },
    ],
  },
]);