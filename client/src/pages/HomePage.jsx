import { Link } from 'react-router';
import { ApiStatus } from '../components/ApiStatus.jsx';
import { MasalaDabba } from '../components/MasalaDabba.jsx';

export default function HomePage() {
  return (
    <section className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
      <title>Rasoi: cook with what you have</title>
      <div className="max-w-xl">
        <h1 className="text-4xl sm:text-6xl">Cook with what you have.</h1>
        <p className="mt-5 text-lg text-ink-soft sm:text-xl">
          Tell Rasoi what&apos;s in your kitchen and it finds the Indian dishes you can make
          tonight. Then it plans your week and writes the grocery list.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/pantry" className="btn btn-primary">
            Cook with what I have
          </Link>
          <Link to="/recipes" className="btn btn-quiet">
            Browse recipes
          </Link>
        </div>
        <div className="mt-8">
          <ApiStatus />
        </div>
      </div>
      <MasalaDabba className="mx-auto size-56 sm:size-72" />
    </section>
  );
}