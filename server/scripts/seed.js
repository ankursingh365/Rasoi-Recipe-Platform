// Loads the recipes and the ingredient catalogue into MongoDB. Run it from the server
// folder with: npm run seed. It's safe to run again: anything already there is skipped.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { Ingredient } from '../src/models/Ingredient.js';
import { Recipe } from '../src/models/Recipe.js';

const BATCH_SIZE = 500;

// Reads a file from server/data. Files ending in .gz are unzipped first.
function readData(fileName) {
  const bytes = readFileSync(new URL(`../data/${fileName}`, import.meta.url));
  const text = (fileName.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString('utf8');
  return JSON.parse(text);
}

// Inserts the documents that aren't in the collection yet. `uniqueField` is how we tell:
// a recipe's slug, an ingredient's key.
async function seedCollection(Model, documents, uniqueField) {
  await Model.syncIndexes(); // make the database's indexes match the schema

  const existing = new Set(await Model.distinct(uniqueField));
  const missing = documents.filter((doc) => !existing.has(doc[uniqueField]));
  console.log(`${Model.modelName}: ${existing.size} already there, ${missing.length} to add`);

  for (let start = 0; start < missing.length; start += BATCH_SIZE) {
    await Model.insertMany(missing.slice(start, start + BATCH_SIZE));
    console.log(`  added ${Math.min(start + BATCH_SIZE, missing.length)} of ${missing.length}`);
  }
}

// The dataset knows "jeera" and "dahi", but not some everyday Hindi names like "pyaz".
// data/extra-aliases.json adds them: { "onion": ["pyaz", "pyaaz", "kanda"], ... }
function withExtraAliases(ingredients) {
  const extra = readData('extra-aliases.json');
  return ingredients.map((ingredient) => ({
    ...ingredient,
    aliases: [...new Set([...ingredient.aliases, ...(extra[ingredient.key] ?? [])])],
  }));
}

try {
  await connectDB(env.MONGODB_URI);

  await seedCollection(Recipe, readData('recipes.json.gz'), 'slug');
  await seedCollection(Ingredient, withExtraAliases(readData('ingredients.json.gz')), 'key');

  const [recipes, ingredients] = await Promise.all([
    Recipe.countDocuments(),
    Ingredient.countDocuments(),
  ]);
  console.log(`Done: ${recipes} recipes and ${ingredients} ingredients in the database`);
} catch (error) {
  console.error('Seeding failed:', error.message);
  process.exitCode = 1; // report the failure, but still run "finally" below
} finally {
  await mongoose.disconnect();
}