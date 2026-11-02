import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { MasalaDabba } from '../components/MasalaDabba.jsx';

// For addresses that match no page, like /nothing-here.
export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center text-center">
      <title>Page not found | Rasoi</title>
      <MasalaDabba className="size-28 opacity-60" />
      <h1 className="mt-6 text-3xl">Nothing in this dabba</h1>
      <p className="mt-2 text-ink-soft">This page doesn&apos;t exist. Check the address, or go:</p>
      <div className="mt-6 flex gap-3">
        <Link to="/recipes" className="btn btn-primary">
          Browse recipes
        </Link>
        <Link to="/" className="btn btn-quiet">
          Home
        </Link>
      </div>
    </section>
  );
}

// Shown instead of a page that crashed while drawing. The header and footer stay.
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <section className="mx-auto max-w-md text-center">
      <title>Something went wrong | Rasoi</title>
      <h1 className="text-3xl">This page hit a snag</h1>
      <p className="mt-2 text-ink-soft">Reload the page. If it keeps happening, try again later.</p>
      <button
        type="button"
        className="btn btn-primary mt-6"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </section>
  );
}