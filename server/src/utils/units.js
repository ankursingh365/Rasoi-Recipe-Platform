// Units that can be converted into each other: every volume into millilitres, every mass
// into grams. Anything else (clove, inch, sprig, pinch...) is only ever added to itself.
const CONVERTIBLE = {
  tsp: { family: 'volume', factor: 5 }, // 1 tsp = 5 ml
  tbsp: { family: 'volume', factor: 15 },
  cup: { family: 'volume', factor: 240 },
  ml: { family: 'volume', factor: 1 },
  l: { family: 'volume', factor: 1000 },
  g: { family: 'mass', factor: 1 },
  kg: { family: 'mass', factor: 1000 },
};

// 2 tbsp -> { family: 'volume', amount: 30 }. 3 cloves -> { family: 'clove', amount: 3 }.
// No unit at all ("2 onions") -> { family: 'count', amount: 2 }.
export function toBase(qty, unit) {
  const convertible = CONVERTIBLE[unit];
  if (!convertible) return { family: unit ?? 'count', amount: qty };
  return { family: convertible.family, amount: qty * convertible.factor };
}

// Writes a total the way a shopping list would, always rounding up so you never buy too
// little: 90 ml -> "½ cup", 300 g -> "300 g", 4.5 tomatoes -> "5", 2.5 inch -> "3 inches".
export function formatAmount(family, amount) {
  if (family === 'volume') {
    if (amount < 15) return `${roundUp(amount / 5)} tsp`;
    if (amount < 60) return `${roundUp(amount / 15)} tbsp`;
    if (amount < 2000) return withUnit(roundUp(amount / 240), 'cup', amount / 240);
    return `${roundUp(amount / 1000)} l`;
  }
  if (family === 'mass') {
    return amount < 1000 ? `${roundUp(amount)} g` : `${roundUp(amount / 1000)} kg`;
  }
  // You can't buy half an onion or half a clove, so whole numbers only.
  const whole = Math.ceil(amount - 0.01);
  return family === 'count' ? String(whole) : withUnit(String(whole), family, whole);
}

// Kitchen fractions, smallest first.
const FRACTIONS = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
];

// 1.4 -> "1½", 0.3 -> "⅓", 2 -> "2", 12.3 -> "13". The 0.01 forgives tiny rounding errors,
// so 0.3334 counts as ⅓ instead of jumping up to ½.
function roundUp(value) {
  if (value >= 10) return String(Math.ceil(value - 0.01));
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.01) return String(whole);
  const fraction = FRACTIONS.find(([size]) => size >= rest - 0.01);
  if (!fraction) return String(whole + 1); // more than ¾: the next whole number
  return `${whole || ''}${fraction[1]}`;
}

const PLURALS = {
  cup: 'cups',
  clove: 'cloves',
  inch: 'inches',
  sprig: 'sprigs',
  pinch: 'pinches',
  stalk: 'stalks',
  drop: 'drops',
  handful: 'handfuls',
  can: 'cans',
  slice: 'slices',
  packet: 'packets',
  piece: 'pieces',
  bunch: 'bunches',
};

// "1 cup", "2 cups", "3 inches"
function withUnit(number, unit, amount) {
  return `${number} ${amount > 1 ? (PLURALS[unit] ?? unit) : unit}`;
}