import mongoose from 'mongoose';

// The ingredient catalogue: every ingredient key used by the recipes, with the other names
// people type for it. It powers autocomplete, and turns "jeera" into "cumin seeds".
const ingredientSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // "cumin seeds", as recipes store it
  name: { type: String, required: true }, // "Cumin seeds", for display
  aliases: { type: [String], default: [] }, // other names: ["jeera"]
  category: { type: String, required: true }, // grocery aisle, for the shopping list (step 16)
  recipeCount: { type: Number, default: 0 }, // how many recipes use it, so popular ones come first
});

ingredientSchema.index({ aliases: 1 });
ingredientSchema.index({ recipeCount: -1 });

export const Ingredient = mongoose.model('Ingredient', ingredientSchema);