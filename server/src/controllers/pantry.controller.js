import { User } from '../models/User.js';
import { resolveIngredients } from '../services/ingredient.service.js';
import { findPantryMatches } from '../services/pantry.service.js';

// GET /api/pantry/recipes?have=onion,tomato,paneer
// The controller only deals with HTTP: read the validated query, send JSON.
// The actual matching lives in a service, so the AI assistant (step 27) can reuse it.
export async function getPantryRecipes(req, res) {
  res.json(await findPantryMatches(req.valid.query));
}

// GET /api/pantry: the logged-in user's saved pantry.
export function getMyPantry(req, res) {
  res.json({ pantry: req.user.pantry });
}

// PUT /api/pantry: replace the saved pantry with this list.
export async function saveMyPantry(req, res) {
  const { keys, unknown } = await resolveIngredients(req.valid.body.items);

  // $set replaces just this one field, without loading or saving the rest of the user.
  await User.updateOne({ _id: req.user._id }, { $set: { pantry: keys } });

  res.json({ pantry: keys, unknown });
}