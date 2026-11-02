import { Ingredient } from '../models/Ingredient.js';

// Turns what people type into the keys recipes use:
//   "jeera" -> "cumin seeds" (an alias), "onions" -> "onion" (a plural), "paneer" -> "paneer".
// Returns the keys it found, plus the words it couldn't place.
export async function resolveIngredients(words) {
  const spellings = words.flatMap(variantsOf);

  // One query for all the words. Most-used first, so "jeera" picks cumin seeds (1,375 recipes)
  // over cumin powder (683) when an alias belongs to both.
  const found = await Ingredient.find({
    $or: [{ key: { $in: spellings } }, { aliases: { $in: spellings } }],
  })
    .sort({ recipeCount: -1 })
    .select('key aliases')
    .lean();

  const keys = [];
  const unknown = [];
  for (const word of words) {
    const options = variantsOf(word);
    const match =
      found.find((ingredient) => ingredient.key === word) ?? // exactly a key
      found.find((ingredient) => options.includes(ingredient.key)) ?? // a plural of a key
      found.find((ingredient) => ingredient.aliases.some((alias) => options.includes(alias)));
    if (match) keys.push(match.key);
    else unknown.push(word);
  }

  return { keys: [...new Set(keys)], unknown };
}

// "tomatoes" -> ["tomatoes", "tomatoess", "tomatoeses", "tomato", "tomatoe"]: the word itself,
// with an s or es added, and with one taken off. Wrong guesses simply match nothing.
function variantsOf(word) {
  return [
    ...new Set([word, `${word}s`, `${word}es`, word.replace(/es$/, ''), word.replace(/s$/, '')]),
  ];
}