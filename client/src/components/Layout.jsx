import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { Logo } from './Logo.jsx';

// The links in the header. Later steps add Saved, Planner and Log in.
const NAV = [
  { to: '/recipes', label: 'Recipes' },
  { to: '/pantry', label: 'Pantry' },
];

// The frame around every page: a header, the page itself (<Outlet />), and a footer.
export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link to="/" aria-label="Rasoi home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="ml-auto flex gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                // NavLink tells us if its page is open, so the current page can look selected.
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 font-medium ${
                    isActive ? 'bg-turmeric-soft text-ink' : 'text-ink-soft hover:bg-sunken'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-16">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
          Recipes adapted from{' '}
          <a className="link" href="https://www.archanaskitchen.com/">
            Archana&apos;s Kitchen
          </a>{' '}
          through the 6000+ Indian Food Recipes Dataset, shared under{' '}
          <a className="link" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          .
        </p>
      </footer>

      {/* Scroll to the top when you open a new page, and back to where you were on "Back". */}
      <ScrollRestoration />
    </div>
  );
}