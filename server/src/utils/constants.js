// Fixed lists of allowed values. The recipe schema rejects anything else, and the
// filters we build in step 8 use the same lists, so they can never disagree.
export const COURSES = ['Breakfast', 'Main Course', 'Side Dish', 'Snack', 'Appetizer', 'Dessert'];

export const DIETS = ['vegan', 'vegetarian', 'eggetarian', 'non-vegetarian'];

// What each diet filter shows: everything that person can eat. A vegetarian can eat
// vegan dishes too. "non-vegetarian" shows only meat and fish dishes.
export const DIET_FILTER = {
  vegan: ['vegan'],
  vegetarian: ['vegan', 'vegetarian'],
  eggetarian: ['vegan', 'vegetarian', 'eggetarian'],
  'non-vegetarian': ['non-vegetarian'],
};

export const REGIONS = [
  'North Indian',
  'South Indian',
  'East & North-East',
  'West Indian',
  'Pan-Indian & Fusion',
  'International',
];

export const TAGS = ['high-protein', 'diabetic-friendly', 'gluten-free', 'sattvic', 'sugar-free'];

// "relevance" (best match) only applies to searches.
export const SORTS = ['relevance', 'popular', 'quickest', 'newest', 'az'];

// Ingredients nearly every kitchen has. They don't make two dishes similar, and in
// step 13 the pantry search can assume you have them.
export const STAPLES = ['salt', 'water', 'oil', 'ice', 'ice cube'];

export const EVERYDAY_SPICES = [
  'turmeric powder',
  'red chilli powder',
  'coriander powder',
  'garam masala powder',
  'cumin seeds',
  'cumin powder',
  'mustard seeds',
  'asafoetida',
  'black pepper powder',
  'sugar',
];

// The colour of the finished dish. The app uses it to draw a coloured plate
// for recipes that have no photo (none of the 5,909 recipes do).
export const TONES = ['brown', 'yellow', 'cream', 'green', 'red', 'orange'];

// The meals of a day, in order. Used by the meal planner (step 16).
export const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

// Grocery aisles in the order you'd walk through a kirana shop. The names match the
// ingredient catalogue's categories.
export const AISLES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains, Flours & Pulses',
  'Spices & Masalas',
  'Oils & Condiments',
  'Nuts & Dry Fruits',
  'Sweeteners',
  'Bakery & Baking',
  'Other',
];

// Never worth putting on a shopping list.
export const NOT_SHOPPED = ['water', 'ice', 'ice cube'];