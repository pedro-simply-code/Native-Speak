export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: { quote: string; author?: string; name?: string }[];
  fillLast?: boolean;
}) {
  return (
    <ul className="space-y-4">
      {testimonials.map((t, i) => (
        <li key={t.author ?? t.name ?? i} className="rounded-lg border p-4 text-sm">
          <p>{t.quote}</p>
          <p className="mt-2 font-semibold">{t.author ?? t.name}</p>
        </li>
      ))}
    </ul>
  );
}
