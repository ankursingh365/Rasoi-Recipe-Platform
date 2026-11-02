import mongoose from 'mongoose';
import { MEAL_SLOTS } from '../utils/constants.js';

// One planned dish: which recipe, on which day and meal, for how many people.
// Each meal keeps its own _id, so it can be moved or removed later.
const mealSchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 0, max: 6 }, // 0 = Monday ... 6 = Sunday
  slot: { type: String, required: true, enum: MEAL_SLOTS },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  servings: { type: Number, required: true, min: 1, max: 50 },
});

// One document per user per week. A week's meals are always read together and there are
// only a few dozen of them, so they're embedded in the plan rather than stored separately.
const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: String, required: true }, // the Monday that starts the week: "2026-11-02"
    meals: { type: [mealSchema], default: [] },
  },
  { timestamps: true },
);

mealPlanSchema.index({ user: 1, week: 1 }, { unique: true });

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);