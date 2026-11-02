import axios from 'axios';

// One Axios instance for every request the app makes. Every path starts with /api, so
// api.get('/recipes') asks for /api/recipes, and Vite's proxy passes it on to the API.
// The page and the API share one address, so the login cookie (step 22) goes along by itself.
export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000, // give up after 15 seconds instead of waiting forever
});

// Turns a failed request into one sentence to show on the page.
export function errorMessage(error) {
  // Our API always explains errors as { error: { message } } (step 6). Show that message.
  const fromApi = error?.response?.data?.error?.message;
  if (fromApi) return fromApi;

  // No answer from our API: it's off, or the network is down, or it took too long.
  if (axios.isAxiosError(error)) return "Can't reach Rasoi right now. Is the server running?";

  // Anything else is a bug in our own code.
  return 'Something went wrong. Please try again.';
}