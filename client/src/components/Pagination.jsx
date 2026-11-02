// "Previous", "Page 2 of 27", "Next". Shows nothing when everything fits on one page.
// It doesn't know where pages come from: it calls onChange with the page number to open.
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pages" className="mt-12 flex items-center justify-center gap-4">
      <button
        type="button"
        className="btn btn-quiet"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <p className="text-sm text-ink-soft">
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        className="btn btn-quiet"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}