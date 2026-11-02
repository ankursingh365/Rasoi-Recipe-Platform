import { DIET_LABELS } from '../lib/format.js';

// The mark printed on food packets in India: a green square with a dot for vegetarian food,
// a square with a triangle for non-vegetarian. Egg dishes get an amber dot of their own.
const MARKS = {
  vegan: { color: 'text-leaf', shape: 'dot' },
  vegetarian: { color: 'text-leaf', shape: 'dot' },
  eggetarian: { color: 'text-egg', shape: 'dot' },
  'non-vegetarian': { color: 'text-chilli', shape: 'triangle' },
};

export function DietMark({ diet, className = 'size-4' }) {
  const mark = MARKS[diet];
  if (!mark) return null; // never guess: a wrong veg mark is worse than none

  return (
    <svg
      viewBox="0 0 16 16"
      role="img"
      aria-label={DIET_LABELS[diet]} // screen readers say "Vegetarian"
      className={`shrink-0 ${mark.color} ${className}`}
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {mark.shape === 'dot' ? (
        <circle cx="8" cy="8" r="3.5" fill="currentColor" />
      ) : (
        <path d="M8 4 12.5 11.5h-9z" fill="currentColor" />
      )}
    </svg>
  );
}