export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="skeleton h-8 w-48 rounded-lg bg-dulce-cream" />
      <div className="skeleton mt-3 h-4 w-72 rounded bg-dulce-cream" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-dulce-border">
            <div className="skeleton aspect-square bg-dulce-cream" />
            <div className="space-y-2 p-3.5">
              <div className="skeleton h-3 w-2/3 rounded bg-dulce-cream" />
              <div className="skeleton h-4 w-full rounded bg-dulce-cream" />
              <div className="skeleton h-5 w-20 rounded bg-dulce-cream" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
