import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    // Stored in lowercase, so "Ankur@Gmail.com" and "ankur@gmail.com" are the same account.
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // Never the password itself: a one-way bcrypt hash of it. select: false leaves it out
    // of every query unless you ask for it by name (only login will, in step 11).
    passwordHash: { type: String, required: true, select: false },
    // Goes up by one on "log out of all devices". Every login token records the number it
    // was made with, and tokens with an old number stop working (see middleware/auth.js).
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    // Whenever a user is turned into JSON for a response, drop the hash and the internal
    // counters (tokenVersion and Mongoose's __v), even if they happen to be loaded.
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);