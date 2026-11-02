import { Link, useParams } from 'react-router';

// Step 21 turns this into the full recipe page. For now it shows which recipe the
// address points at: /recipes/masala-karela gives slug = "masala-karela".
export default function RecipePage() {
  const { slug } = useParams();

  return (
    <section>
      <title>Recipe | Rasoi</title>
      <Link className="link text-sm" to="/recipes">
        All recipes
      </Link>
      <h1 className="mt-3 text-4xl">Recipe page</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        This address asks for the recipe <strong className="text-ink">{slug}</strong>. In step 21
        the page loads it from the API and shows its ingredients and steps.
      </p>
    </section>
  );
}