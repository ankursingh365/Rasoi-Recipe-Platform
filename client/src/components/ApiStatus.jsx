import { errorMessage } from '../api/client.js';
import { useRecipes } from '../api/recipes.js';

// A small line that says whether the app can reach the API. In step 17 this needed useState,
// useEffect and an AbortController. Now one hook does all of that, and caches the answer.
export function ApiStatus() {
  const { data, error } = useRecipes({ limit: 1 });

  // Three states, three looks: a coloured dot and a sentence.
  let dot = 'bg-line-strong';
  let message = 'Checking the kitchen…';
  if (error) {
    dot = 'bg-chilli';
    message = errorMessage(error);
  } else if (data) {
    dot = 'bg-leaf';
    message = `Connected: ${data.total.toLocaleString('en-IN')} recipes ready to cook.`;
  }

  return (
    <p className="flex items-center gap-2 text-sm text-muted" role="status">
      <span className={`size-2.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {message}
    </p>
  );
}