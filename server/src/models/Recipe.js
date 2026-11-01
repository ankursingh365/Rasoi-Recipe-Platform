import mongoose from 'mongoose';
import { COURSES, DIETS, REGIONS, TAGS, TONES } from '../utils/constants.js';

// One line of the ingredient list. We keep the line exactly as written (raw) for display,
// plus the parts we can calculate with: "3 tablespoon Gram flour" -> qty 3, unit "tbsp".
const ingredientSchema = new mongoose.Schema(
  {
    raw: { type: String, required: true, maxlength: 300 }, // "3 tablespoon Gram flour (besan)"
    name: { type: String, required: true, maxlength: 200 }, // "Gram flour (besan)"
    key: { type: String, required: true, maxlength: 120 }, // "gram flour", same in every recipe
    qty: { type: Number, min: 0 }, // 3
    qtyMax: { type: Number, min: 0 }, // for ranges like "2 to 3 green chillies"
    unit: { type: String, maxlength: 20 }, // "tbsp"
    note: { type: String, maxlength: 200 }, // "finely chopped"
  },
  { _id: false }, // ingredient lines don't need ids of their own
);

// Mongoose's `required` accepts an empty list, so lists get their own check.
const notEmpty = (what) => ({
  validator: (list) => list.length > 0,
  message: `Add at least one ${what}`,
});

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'A recipe needs a title'], trim: true, maxlength: 140 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true }, // "masala-karela", used in URLs
    cuisine: { type: String, required: true, trim: true, maxlength: 60 },
    region: { type: String, required: true, enum: REGIONS },
    course: { type: String, required: true, enum: COURSES },
    diet: { type: String, required: true, enum: DIETS },
    tags: { type: [String], enum: TAGS, default: [] },
    prepTime: { type: Number, min: 0 }, // all times are in minutes
    cookTime: { type: Number, min: 0 },
    totalTime: { type: Number, min: 0 },
    servings: { type: Number, required: true, min: 1, max: 100 },
    ingredients: { type: [ingredientSchema], validate: notEmpty('ingredient') },
    steps: { type: [{ type: String, trim: true, maxlength: 2000 }], validate: notEmpty('step') },
    // The ingredient keys again as a flat list, filled in automatically (see below), so that
    // "recipes that use onion" is one fast index lookup. The pantry search in step 13 needs it.
    ingredientKeys: { type: [String], default: [] },
    tone: { type: String, enum: TONES, default: 'cream' },
    source: { name: String, url: String }, // where an adapted recipe came from

    // Used by later steps:
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 }, // step 15 (reviews)
    ratingCount: { type: Number, default: 0, min: 0 }, // step 15
    image: { url: String, publicId: String }, // step 26 (photo uploads)
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // step 26
  },
  { timestamps: true }, // adds createdAt and updatedAt, kept up to date automatically
);

// Middleware on the schema: runs before every validation, so ingredientKeys can never
// get out of step with the ingredients. A Set removes duplicates.
recipeSchema.pre('validate', function () {
  this.ingredientKeys = [...new Set(this.ingredients.map((ingredient) => ingredient.key))];
});

// Indexes. Each one makes a particular kind of query fast.
recipeSchema.index({ ingredientKeys: 1 }); // recipes that use an ingredient (step 13)
recipeSchema.index({ course: 1, diet: 1 }); // filtering by course and diet (step 8)
recipeSchema.index({ totalTime: 1 }); // "ready in 30 minutes or less" (step 8)
recipeSchema.index({ ratingCount: -1 }); // "most reviewed first" (step 15)
// Full-text search (step 9). The weights make a match in the title count the most.
recipeSchema.index(
  { title: 'text', subtitle: 'text', cuisine: 'text', 'ingredients.name': 'text' },
  { name: 'recipe_text', weights: { title: 10, subtitle: 4, cuisine: 3, 'ingredients.name': 2 } },
);

export const Recipe = mongoose.model('Recipe', recipeSchema);