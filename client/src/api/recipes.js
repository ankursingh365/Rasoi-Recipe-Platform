import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from './client.js';

// Hooks that load recipe data. Pages call these instead of talking to the API themselves.

// One page of recipes: { items, page, limit, total, totalPages }.
// filters holds what GET /api/recipes accepts: { q, course, diet, region, maxTime, sort, page }.
export function useRecipes(filters) {
  return useQuery({
    // The name of this answer in the cache. Different filters make a different name, and each
    // is cached on its own. TanStack Query compares keys by what's inside them, so a new
    // object with the same filters finds the same cached answer.
    queryKey: ['recipes', filters],

    // How to fetch it. Axios turns params into the query string: ?course=Dessert&page=2.
    // signal cancels the request if nothing needs the answer any more.
    queryFn: async ({ signal }) => {
      const response = await api.get('/recipes', { params: filters, signal });
      return response.data;
    },

    // While the next answer loads, keep showing the last one instead of an empty page.
    placeholderData: keepPreviousData,
  });
}

// The allowed filter values, for the drop-down menus: { courses, diets, regions, sorts, ... }.
export function useRecipeFilters() {
  return useQuery({
    queryKey: ['recipe-filters'],
    queryFn: async ({ signal }) => {
      const response = await api.get('/recipes/filters', { signal });
      return response.data;
    },
    staleTime: Infinity, // these only change when the code changes, so fetch them once
  });
}