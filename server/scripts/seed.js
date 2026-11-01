// Loads the recipe dataset into MongoDB. Run it from the server folder with: npm run seed
// It's safe to run again: recipes that are already in the database are skipped.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { Recipe } from '../src/models/Recipe.js';

const BATCH_SIZE = 500;

try {
  // 1. Read the compressed file, unzip it, and turn the JSON text into an array of objects.
  const file = new URL('../data/recipes.json.gz', import.meta.url);
  const recipes = JSON.parse(gunzipSync(readFileSync(file)).toString('utf8'));
  console.log(`Read ${recipes.length} recipes from data/recipes.json.gz`);

  await connectDB(env.MONGODB_URI);

  // 2. Make the indexes in the database match the schema.
  await Recipe.syncIndexes();

  // 3. Skip recipes that are already there, so running the script twice adds nothing twice.
  const existing = new Set(await Recipe.distinct('slug'));
  const missing = recipes.filter((recipe) => !existing.has(recipe.slug));
  console.log(`${existing.size} already in the database, ${missing.length} to add`);

  // 4. Insert in batches, so you can watch the progress.
  for (let start = 0; start < missing.length; start += BATCH_SIZE) {
    await Recipe.insertMany(missing.slice(start, start + BATCH_SIZE));
    console.log(`  added ${Math.min(start + BATCH_SIZE, missing.length)} of ${missing.length}`);
  }

  console.log(`Done: ${await Recipe.countDocuments()} recipes in the database`);
} catch (error) {
  console.error('Seeding failed:', error.message);
  process.exitCode = 1; // report the failure, but still run "finally" below
} finally {
  await mongoose.disconnect();
}