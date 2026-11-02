import { MasalaDabba } from './MasalaDabba.jsx';

// The masala dabba and the name, side by side.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <MasalaDabba className="size-8" />
      <span className="text-2xl font-bold tracking-tight [font-stretch:125%]">Rasoi</span>
    </span>
  );
}