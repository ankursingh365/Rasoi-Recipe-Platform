import { AISLES, NOT_SHOPPED } from '../utils/constants.js';
import { formatAmount, toBase } from '../utils/units.js';

// Adds up the ingredients of every planned meal into one shopping list, grouped by aisle.
//   meals:     the week's meals, each with its recipe's servings and ingredients
//   catalogue: the ingredients involved, from the catalogue (for names and aisles)
//   pantry:    the user's saved pantry; those items are set aside as "already have"
export function buildGroceryList(meals, catalogue, pantry = []) {
  const known = new Map(catalogue.map((ingredient) => [ingredient.key, ingredient]));
  const items = new Map(); // ingredient key -> everything we've added up for it

  for (const { recipe, servings } of meals) {
    // A recipe written for 4 but planned for 6 needs 1.5 times every ingredient.
    const scale = servings / recipe.servings;

    for (const ingredient of recipe.ingredients) {
      if (NOT_SHOPPED.includes(ingredient.key)) continue;

      if (!items.has(ingredient.key)) {
        items.set(ingredient.key, {
          key: ingredient.key,
          name: known.get(ingredient.key)?.name ?? ingredient.key,
          aisle: known.get(ingredient.key)?.category ?? 'Other',
          totals: new Map(), // unit family -> amount, e.g. 'volume' -> 45 (ml)
          asNeeded: false,
          recipes: new Set(),
        });
      }
      const item = items.get(ingredient.key);
      item.recipes.add(recipe.title);

      if (ingredient.qty == null) {
        item.asNeeded = true; // "Salt - to taste" has no amount
        continue;
      }
      // Buy for the top of a range: "2 to 3 green chillies" means 3.
      const { family, amount } = toBase(
        (ingredient.qtyMax ?? ingredient.qty) * scale,
        ingredient.unit,
      );
      item.totals.set(family, (item.totals.get(family) ?? 0) + amount);
    }
  }

  // Lay it out: aisles in shop order, items A to Z, and pantry items set aside.
  const inPantry = new Set(pantry);
  const byAisle = new Map(AISLES.map((aisle) => [aisle, []]));
  const alreadyHave = [];

  for (const item of items.values()) {
    const row = {
      key: item.key,
      name: item.name,
      quantity: describe(item),
      recipes: [...item.recipes],
    };
    if (inPantry.has(item.key)) alreadyHave.push(row);
    else (byAisle.get(item.aisle) ?? byAisle.get('Other')).push(row);
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  return {
    aisles: AISLES.filter((aisle) => byAisle.get(aisle).length > 0).map((aisle) => ({
      name: aisle,
      items: byAisle.get(aisle).sort(byName),
    })),
    alreadyHave: alreadyHave.sort(byName),
    total: items.size - alreadyHave.length,
  };
}

// The amounts of one item, joined: "8 + 3 tbsp" when recipes used different kinds of unit.
// Counts and volumes can't honestly be added together, so both are shown.
function describe(item) {
  const parts = [...item.totals].map(([family, amount]) => formatAmount(family, amount));
  if (parts.length === 0) return 'as needed';
  return parts.join(' + ');
}