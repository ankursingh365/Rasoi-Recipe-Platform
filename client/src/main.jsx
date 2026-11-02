import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { queryClient } from './api/queryClient.js';
import './index.css';
import { router } from './router.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Hands the one cache to every component, so any of them can call useQuery. */}
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* A panel for looking inside the cache. Only in development: the build leaves it out. */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>,
);