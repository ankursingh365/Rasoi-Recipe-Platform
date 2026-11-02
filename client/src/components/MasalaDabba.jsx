// The round steel spice box found in almost every Indian kitchen, seen from above:
// turmeric in the middle and six more spices around it. It's Rasoi's logo, and the
// picture on the home page. className sets its size, e.g. "size-8" or "size-72".
const CUPS = [
  { name: 'turmeric', color: '#f0ae1c', x: 32, y: 32 },
  { name: 'red chilli', color: '#b02a1e', x: 32, y: 15 },
  { name: 'garam masala', color: '#7a5532', x: 46.7, y: 23.5 },
  { name: 'cardamom', color: '#2e6b34', x: 46.7, y: 40.5 },
  { name: 'coriander', color: '#d98b2b', x: 32, y: 49 },
  { name: 'mustard seeds', color: '#3b2a22', x: 17.3, y: 40.5 },
  { name: 'cumin', color: '#c9b37e', x: 17.3, y: 23.5 },
];

export function MasalaDabba({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="31" className="fill-steel-rim" />
      <circle cx="32" cy="32" r="27" className="fill-steel-shine" />
      {CUPS.map((cup) => (
        <circle
          key={cup.name}
          cx={cup.x}
          cy={cup.y}
          r={cup.name === 'turmeric' ? 8 : 7}
          fill={cup.color}
          className="stroke-steel-rim"
          strokeWidth="1.2"
        />
      ))}
    </svg>
  );
}