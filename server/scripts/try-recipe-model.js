// A one-off experiment: save a recipe, break the rules on purpose, then clean up.
// Run it from the server folder with: node scripts/try-recipe-model.js
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { Recipe } from '../src/models/Recipe.js';

await connectDB(env.MONGODB_URI);
await Recipe.init(); // creates the "recipes" collection and builds the schema's indexes
await Recipe.deleteOne({ slug: 'test-jeera-rice' }); // in case an earlier run stopped halfway

// 1. A recipe that follows every rule.
const recipe = await Recipe.create({
  title: 'Jeera Rice',
  slug: 'test-jeera-rice',
  cuisine: 'North Indian',
  region: 'North Indian',
  course: 'Main Course',
  diet: 'vegan',
  servings: 2,
  totalTime: 25,
  ingredients: [
    { raw: '1 cup Basmati rice', name: 'Basmati rice', key: 'basmati rice', qty: 1, unit: 'cup' },
    { raw: '1 teaspoon Cumin seeds', name: 'Cumin seeds', key: 'cumin seeds', qty: 1, unit: 'tsp' },
  ],
  steps: ['Rinse the rice.', 'Fry the cumin in oil, add the rice and water, and cook.'],
});
console.log('\n1. Saved:', recipe.title, '| id:', recipe.id);
console.log('   ingredientKeys, filled in by the hook:', recipe.ingredientKeys);
console.log('   defaults: tone =', recipe.tone, '| ratingAvg =', recipe.ratingAvg);
console.log('   timestamps: createdAt =', recipe.createdAt.toISOString());

// 2. A recipe that breaks the rules.
try {
  await Recipe.create({ title: '   ', course: 'Lunch', diet: 'vegetarian', servings: 0 });
} catch (error) {
  console.log('\n2. Rejected, with one message per field:');
  for (const [field, problem] of Object.entries(error.errors)) {
    console.log(`   ${field}: ${problem.message}`);
  }
}

// 3. Two recipes can't share a slug: the unique index stops it.
try {
  await Recipe.create({ ...recipe.toObject(), _id: undefined });
} catch (error) {
  console.log('\n3. Duplicate slug rejected. MongoDB error code:', error.code);
}

// 4. The indexes MongoDB built from the schema.
const indexes = await Recipe.collection.indexes();
console.log('\n4. Indexes:', indexes.map((index) => index.name).join(', '));

// Clean up, so the collection is empty again for step 7.
await Recipe.deleteOne({ _id: recipe._id });
await mongoose.disconnect();