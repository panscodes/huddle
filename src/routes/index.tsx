import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Huddle — Find community sports sessions near you" },
      { name: "description", content: "Browse upcoming pickup games and community sports meetups, then join with one tap." },
      { property: "og:title", content: "Huddle — Community sports meetups" },
      { property: "og:description", content: "Browse upcoming pickup games and community sports meetups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Index() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, participants(count)")
        .gte("starts_at", new Date(Date.now() - 3 * 3600e3).toISOString())
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });
  const list = (data ?? []).filter((s) =>
    `${s.title} ${s.sport} ${s.location_name}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <section className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold sm:text-5xl">Play together, nearby.</h1>
        <p className="mt-3 text-lg text-muted-foreground">Pickup games and community sessions hosted by people in your area.</p>
        <Input className="mt-6 h-12" placeholder="Search by sport, title or place…" value={q} onChange={(e) => setQ(e.target.value)} />
      </section>

      {isLoading ? (
        <p className="text-muted-foreground">Loading sessions…</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No upcoming sessions yet. <Link to="/sessions/new" className="text-primary underline">Host the first one</Link>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((s) => {
            const count = (s.participants as unknown as { count: number }[])[0]?.count ?? 0;
            const full = count >= s.capacity;
            return (
              <Link
                key={s.id}
                to="/sessions/$id"
                params={{ id: s.id }}
                className="group rounded-xl border bg-card p-5 shadow-soft transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="secondary">{s.sport}</Badge>
                  {full && <Badge className="bg-warning text-warning-foreground hover:bg-warning">Waitlist</Badge>}
                </div>
                <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{s.title}</h2>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatWhen(s.starts_at)}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{s.location_name}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" />{Math.min(count, s.capacity)}/{s.capacity} going</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
