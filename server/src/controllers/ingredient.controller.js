import { Ingredient } from '../models/Ingredient.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// GET /api/ingredients?q=jee: suggestions for the pantry's search box, most-used first.
export async function searchIngredients(req, res) {
  const { q, limit } = req.valid.query;

  // \b means "start of a word", so "chil" finds "green chilli", and "jee" finds the alias "jeera".
  const startOfWord = new RegExp(`\\b${escapeRegex(q)}`);

  const items = await Ingredient.find({ $or: [{ key: startOfWord }, { aliases: startOfWord }] })
    .sort({ recipeCount: -1, key: 1 })
    .limit(limit)
    .select('-_id key name aliases category')
    .lean();

  res.json({ items });
}