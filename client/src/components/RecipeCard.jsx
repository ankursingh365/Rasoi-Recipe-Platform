import { Link } from 'react-router';
import { formatMinutes } from '../lib/format.js';
import { DietMark } from './DietMark.jsx';
import { Plate } from './Plate.jsx';

// One recipe in a grid: its plate (or photo), its name and a few facts.
export function RecipeCard({ recipe }) {
  const time = formatMinutes(recipe.totalTime);

  return (
    // "relative" lets the link below stretch over the whole card. "group" lets the plate
    // react when the mouse is anywhere on the card (group-hover).
    <article className="group relative">
      {recipe.image?.url ? (
        <img
          src={recipe.image.url}
          alt=""
          loading="lazy"
          className="aspect-square w-full rounded-full object-cover"
        />
      ) : (
        <Plate
          tone={recipe.tone}
          seed={recipe.slug}
          className="w-full transition-transform duration-500 ease-out motion-safe:group-hover:rotate-6"
        />
      )}

      <h2 className="mt-3 flex items-start gap-2 text-base leading-snug font-semibold [font-stretch:105%] sm:text-lg">
        <DietMark diet={recipe.diet} className="mt-[0.2em] size-4" />
        {/* after:absolute after:inset-0 stretches the link's clickable area over the card. */}
        <Link to={`/recipes/${recipe.slug}`} className="after:absolute after:inset-0">
          <span className="line-clamp-2">{recipe.title}</span>
        </Link>
      </h2>

      {recipe.subtitle && (
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{recipe.subtitle}</p>
      )}

      <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-soft">
        <span>{recipe.cuisine}</span>
        {time && <span>{time}</span>}
        {recipe.ratingCount > 0 && (
          <span>
            <span aria-hidden="true">★ </span>
            {recipe.ratingAvg.toFixed(1)}
            <span className="sr-only"> out of 5</span>
          </span>
        )}
      </p>
    </article>
  );
}