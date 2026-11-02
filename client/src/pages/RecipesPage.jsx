import { useSearchParams } from 'react-router';
import { errorMessage } from '../api/client.js';
import { useRecipeFilters, useRecipes } from '../api/recipes.js';
import { MasalaDabba } from '../components/MasalaDabba.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { RecipeCard } from '../components/RecipeCard.jsx';
import { DIET_LABELS, SORT_LABELS } from '../lib/format.js';

// The filters live in the address: /recipes?course=Dessert&maxTime=30&page=2. So a filtered
// list can be bookmarked or shared, and Back and Forward step through your filter changes.
const FILTER_NAMES = ['q', 'course', 'diet', 'region', 'maxTime', 'sort', 'page'];
const TIMES = [15, 30, 45, 60]; // minutes, for the "Time" menu
const GRID = 'grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8';

export default function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read the filters from the address, skipping empty ones: { course: 'Dessert', page: '2' }.
  const filters = {};
  for (const name of FILTER_NAMES) {
    const value = searchParams.get(name);
    if (value) filters[name] = value;
  }

  const recipes = useRecipes(filters);
  const options = useRecipeFilters().data; // undefined until the menus' values arrive

  // Change some filters in the address. Changing anything but the page goes back to page 1.
  function update(changes) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const [name, value] of Object.entries(changes)) {
        if (value) next.set(name, value);
        else next.delete(name); // empty means "any": leave it out of the address
      }
      if (!('page' in changes)) next.delete('page');
      return next;
    });
  }

  function search(event) {
    event.preventDefault(); // stop the browser from reloading the page to submit the form
    const q = new FormData(event.currentTarget).get('q').trim();
    update({ q, sort: null }); // a new search starts with the best matches first
  }

  const clearAll = () => setSearchParams({});
  const goToPage = (page) => update({ page: page > 1 ? String(page) : null });
  const hasFilters = Object.keys(filters).some((name) => name !== 'page');
  const defaultSort = filters.q ? 'relevance' : 'popular'; // the API's own default

  return (
    <section>
      <title>Recipes | Rasoi</title>
      <h1 className="text-4xl">Recipes</h1>
      <p className="mt-3 text-ink-soft">Search by dish or ingredient, then narrow it down.</p>

      {/* key={filters.q}: when the search in the address changes (Back, or "Clear filters"),
          React builds a fresh box that starts with the new text. */}
      <form role="search" onSubmit={search} className="mt-8 flex gap-2">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <input
          key={filters.q}
          id="recipe-search"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Paneer, dal, dosa…"
          className="field flex-1"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Select label="Course" value={filters.course} onChange={(course) => update({ course })}>
          <option value="">Any course</option>
          {options?.courses.map((course) => (
            <option key={course}>{course}</option>
          ))}
        </Select>

        <Select label="Diet" value={filters.diet} onChange={(diet) => update({ diet })}>
          <option value="">Any diet</option>
          {options?.diets.map((diet) => (
            <option key={diet} value={diet}>
              {DIET_LABELS[diet]}
            </option>
          ))}
        </Select>

        <Select label="Region" value={filters.region} onChange={(region) => update({ region })}>
          <option value="">Any region</option>
          {options?.regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </Select>

        <Select label="Time" value={filters.maxTime} onChange={(maxTime) => update({ maxTime })}>
          <option value="">Any time</option>
          {TIMES.map((minutes) => (
            <option key={minutes} value={minutes}>
              Up to {minutes} min
            </option>
          ))}
        </Select>

        <Select
          label="Sort by"
          value={filters.sort ?? defaultSort}
          onChange={(sort) => update({ sort })}
        >
          {/* The page needs a label for every sort anyway, so this list comes from SORT_LABELS. */}
          {Object.entries(SORT_LABELS)
            .filter(([sort]) => sort !== 'relevance' || filters.q) // "Best match" needs a search
            .map(([sort, label]) => (
              <option key={sort} value={sort}>
                {label}
              </option>
            ))}
        </Select>
      </div>

      <Results query={recipes} hasFilters={hasFilters} onClear={clearAll} onPage={goToPage} />
    </section>
  );
}

// A labelled drop-down. value is a filter from the address, or undefined for "any".
function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <select className="field" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}

// Everything under the filters. One state at a time: loading, failed, nothing found, or recipes.
function Results({ query, hasFilters, onClear, onPage }) {
  // 1. The very first load: grey shapes where the cards will be.
  if (query.isPending) {
    return (
      <div className="mt-10">
        <p className="sr-only" role="status">
          Loading recipes…
        </p>
        <ul className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="motion-safe:animate-pulse" aria-hidden="true">
              <div className="aspect-square rounded-full bg-sunken" />
              <div className="mt-4 h-4 w-3/4 rounded bg-sunken" />
              <div className="mt-2 h-3 w-1/2 rounded bg-sunken" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 2. The request failed: say why, and offer to try again.
  if (query.isError) {
    return (
      <div role="alert" className="mt-10 rounded-lg border border-chilli/40 bg-chilli-soft p-5">
        <h2 className="text-lg">Couldn&apos;t load recipes</h2>
        <p className="mt-1 text-ink-soft">{errorMessage(query.error)}</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="btn btn-quiet"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            {query.isFetching ? 'Trying…' : 'Try again'}
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-quiet" onClick={onClear}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    );
  }

  const { items, total, page, totalPages } = query.data;

  // 3. It worked, but nothing matches.
  if (total === 0) {
    return (
      <div className="mt-16 flex flex-col items-center text-center">
        <MasalaDabba className="size-24 opacity-60" />
        <h2 className="mt-6 text-2xl">No recipes match</h2>
        <p className="mt-2 text-ink-soft">Try a different search, or fewer filters.</p>
        <button type="button" className="btn btn-quiet mt-6" onClick={onClear}>
          Clear filters
        </button>
      </div>
    );
  }

  // 4. Recipes! isPlaceholderData is true while these are the old results and the new ones
  //    are on their way (keepPreviousData), so the grid fades a little until they arrive.
  return (
    <div className="mt-8">
      <p className="flex flex-wrap items-baseline gap-x-4 text-sm text-ink-soft" aria-live="polite">
        <span>
          {total.toLocaleString('en-IN')} {total === 1 ? 'recipe' : 'recipes'}
        </span>
        {query.isPlaceholderData && <span>Updating…</span>}
        {hasFilters && (
          <button type="button" className="link" onClick={onClear}>
            Clear filters
          </button>
        )}
      </p>

      <ul
        className={`${GRID} mt-4 transition-opacity ${query.isPlaceholderData ? 'opacity-50' : ''}`}
      >
        {items.map((recipe) => (
          <li key={recipe._id}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>

      <Pagination page={page} totalPages={totalPages} onChange={onPage} />
    </div>
  );
}