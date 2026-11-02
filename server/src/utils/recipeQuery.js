import { DIET_FILTER } from './constants.js';

// Shared by every endpoint that returns lists of recipes (recipes, pantry, and later more).

// Only what a recipe card shows. Lists never send the ingredients or steps.
export const CARD_FIELDS =
  'title subtitle slug course diet cuisine region tags totalTime servings tone image ratingAvg ratingCount';

// The same fields in the format an aggregation's $project stage expects: { title: 1, ... }.
export const CARD_PROJECTION = Object.fromEntries(
  CARD_FIELDS.split(' ').map((field) => [field, 1]),
);

// Turns the filter options from a request into a MongoDB filter.
export function buildRecipeFilter({ course, diet, region, tag, maxTime }) {
  const filter = {};
  if (course) filter.course = course;
  if (diet) filter.diet = { $in: DIET_FILTER[diet] };
  if (region) filter.region = region;
  if (tag) filter.tags = tag;
  if (maxTime) filter.totalTime = { $lte: maxTime };
  return filter;
}