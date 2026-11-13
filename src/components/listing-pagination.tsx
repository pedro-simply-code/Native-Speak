export function ListingPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
  onPageChange?: (next: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <p className="text-sm text-[var(--theme-muted)]">
      Page {page} of {totalPages}
    </p>
  );
}
