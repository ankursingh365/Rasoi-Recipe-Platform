import mongoose from 'mongoose';

// One document per "user saved this recipe". A separate collection, rather than a list
// inside the user, because one user can save any number of recipes, and we want to know
// when each was saved and how many people saved a recipe.
const savedRecipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  },
  { timestamps: true }, // createdAt is "saved at"
);

// A user can save a recipe only once. The same index also makes "this user's saved
// recipes, newest first" fast, because it starts with user.
savedRecipeSchema.index({ user: 1, recipe: 1 }, { unique: true });
savedRecipeSchema.index({ user: 1, createdAt: -1 });

export const SavedRecipe = mongoose.model('SavedRecipe', savedRecipeSchema);