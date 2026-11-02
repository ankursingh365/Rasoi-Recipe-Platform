// Turning values from the API into words for the page.

export const DIET_LABELS = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  eggetarian: 'Eggetarian',
  'non-vegetarian': 'Non-vegetarian',
};

export const SORT_LABELS = {
  relevance: 'Best match',
  popular: 'Most popular',
  quickest: 'Quickest',
  newest: 'Newest',
  az: 'A to Z',
};

// 45 -> "45 min", 60 -> "1 hr", 90 -> "1 hr 30 min". No time -> null, so nothing is shown.
export function formatMinutes(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}