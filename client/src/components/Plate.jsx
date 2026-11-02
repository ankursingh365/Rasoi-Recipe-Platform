// None of the 5,909 recipes has a photo, so each one gets a steel plate drawn from above,
// filled with the colour of the dish (its "tone" from the API). The recipe's slug decides the
// garnish and whether a katori (a small bowl) sits on the rim, so a dish always looks the same.

// For each tone: [the food, a lighter patch where the food catches the light].
const FOOD = {
  brown: ['#7a4a26', '#a8703f'],
  yellow: ['#d99a16', '#f2c858'],
  cream: ['#ddcca8', '#f3ead4'],
  green: ['#4d7d2c', '#7fa952'],
  red: ['#b03a25', '#da6a4c'],
  orange: ['#d2701e', '#eea257'],
};

// Turns text into a number. The same text always gives the same number.
function hashText(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

// "Random" numbers between 0 and 1 that come out the same every time for the same seed.
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// An uneven round shape, like food on a plate: 8 points around the middle (50, 50) at
// slightly random distances, joined by smooth curves. Returns an SVG path.
function blob(random, radius) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    const distance = radius * (0.92 + random() * 0.16);
    return [50 + distance * Math.cos(angle), 50 + distance * Math.sin(angle)];
  });
  const round = (n) => n.toFixed(1);
  const midpoint = (a, b) => `${round((a[0] + b[0]) / 2)} ${round((a[1] + b[1]) / 2)}`;

  let path = `M ${midpoint(points[7], points[0])}`;
  points.forEach((point, i) => {
    const next = points[(i + 1) % 8];
    path += ` Q ${round(point[0])} ${round(point[1])} ${midpoint(point, next)}`;
  });
  return `${path} Z`;
}

export function Plate({ tone, seed, className = '' }) {
  const random = seededRandom(hashText(seed));
  const [food, light] = FOOD[tone] ?? FOOD.cream;
  const garnish = tone === 'green' ? '#f4eedf' : '#3f7a2a'; // cream on green food, else coriander

  const leaves = Array.from({ length: 7 }, () => {
    const angle = random() * 2 * Math.PI;
    const distance = random() * 22;
    return {
      x: 50 + distance * Math.cos(angle),
      y: 50 + distance * Math.sin(angle),
      turn: Math.round(random() * 180),
    };
  });

  // Four plates in ten get a katori of raita or green chutney, somewhere on the rim.
  const katori = random() < 0.4 && {
    turn: Math.round(random() * 360),
    fill: random() < 0.5 ? '#f1ece0' : '#6b9a3e',
  };

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {/* The steel plate: the rim, a shine along the rim, and the flat middle. */}
      <circle cx="50" cy="50" r="48" className="fill-steel-rim" />
      <circle
        cx="50"
        cy="50"
        r="45.5"
        fill="none"
        className="stroke-steel-shine"
        strokeWidth="1.2"
        strokeDasharray="60 230"
        transform="rotate(195 50 50)"
      />
      <circle cx="50" cy="50" r="42" className="fill-steel-shine" />

      {/* The food, a lighter patch on it, and the garnish leaves. */}
      <path d={blob(random, 30)} fill={food} />
      <path d={blob(random, 15)} fill={light} opacity="0.6" transform="translate(-4 -4)" />
      {leaves.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx="2.4"
          ry="1.2"
          fill={garnish}
          transform={`rotate(${leaf.turn} ${leaf.x} ${leaf.y})`}
        />
      ))}

      {/* The katori is drawn at the top of the plate, then turned around the middle. */}
      {katori && (
        <g transform={`rotate(${katori.turn} 50 50)`}>
          <circle cx="50" cy="12" r="10" className="fill-steel-rim stroke-steel-shine" />
          <circle cx="50" cy="12" r="7.5" fill={katori.fill} />
        </g>
      )}
    </svg>
  );
}