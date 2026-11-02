import { QueryClient } from '@tanstack/react-query';

// The cache for the whole app. Every useQuery reads its answer from here, or fetches it and
// stores it here, so two components that ask for the same data share one request.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // An answer counts as fresh for one minute. Asking again within that minute uses the
      // cached answer and sends no request.
      staleTime: 60_000,
      // Don't fetch again just because you switched back to this browser tab.
      refetchOnWindowFocus: false,
      // Try a failed request once more, unless the API said the request itself was wrong
      // (a 4xx status). Sending the same request again would get the same answer.
      retry: (failureCount, error) => {
        const status = error.response?.status ?? 0;
        if (status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});