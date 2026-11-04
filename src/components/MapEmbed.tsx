export function MapEmbed({ query }: { query: string }) {
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  if (!key) return null;
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`;
  return (
    <div className="overflow-hidden rounded-xl border bg-muted" style={{ height: 300 }}>
      <iframe title="Session location" src={src} className="h-full w-full border-0" loading="lazy" allowFullScreen />
    </div>
  );
}
