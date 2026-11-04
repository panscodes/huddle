import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/lib/auth";
import { splitRoster } from "@/lib/roster";
import { MapEmbed } from "@/components/MapEmbed";
import { InstagramLink } from "@/components/InstagramLink";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/sessions/$id")({
  head: () => ({
    meta: [
      { title: "Session details — Huddle" },
      { name: "description", content: "See who's playing, where and when, and join this community sports session." },
      { property: "og:title", content: "Session details — Huddle" },
      { property: "og:description", content: "Join this community sports session on Huddle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SessionPage,
});

type Person = { user_id: string; joined_at: string; profiles: { id: string; display_name: string; avatar_url: string | null; instagram_handle: string | null } | null };

function PersonRow({ p }: { p: Person }) {
  const prof = p.profiles;
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <Link to="/players/$id" params={{ id: p.user_id }} className="flex items-center gap-3 hover:text-primary">
        <Avatar className="h-8 w-8">
          <AvatarImage src={prof?.avatar_url ?? undefined} />
          <AvatarFallback>{prof?.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{prof?.display_name ?? "Player"}</span>
      </Link>
      <InstagramLink handle={prof?.instagram_handle} compact />
    </li>
  );
}

function SessionPage() {
  const { id } = Route.useParams();
  const { user } = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: s, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, host:profiles!sessions_host_id_fkey(id, display_name, avatar_url, instagram_handle), participants(user_id, joined_at, profiles(id, display_name, avatar_url, instagram_handle))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!s) return <p>Session not found.</p>;

  const { confirmed, waitlist } = splitRoster((s.participants ?? []) as Person[], s.capacity);
  const mine = (s.participants ?? []).some((p) => p.user_id === user?.id);
  const myWait = waitlist.findIndex((p) => p.user_id === user?.id);
  const isHost = user?.id === s.host_id;
  const full = confirmed.length >= s.capacity;
  const locQuery = [s.location_name, s.address].filter(Boolean).join(", ");

  async function join() {
    if (!user) return navigate({ to: "/auth" });
    const { error } = await supabase.from("participants").insert({ session_id: id, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success(full ? "You're on the waitlist." : "You're in!");
    qc.invalidateQueries();
  }
  async function leave() {
    const { error } = await supabase.from("participants").delete().eq("session_id", id).eq("user_id", user!.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
  }
  async function remove() {
    if (!confirm("Delete this session?")) return;
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    navigate({ to: "/" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <Badge variant="secondary">{s.sport}</Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{s.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(s.starts_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{s.duration_minutes} min</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{locQuery}</span>
          </div>
        </div>
        {s.description && <p className="whitespace-pre-line leading-relaxed">{s.description}</p>}
        <MapEmbed query={locQuery} />
        {s.host && (
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <Link to="/players/$id" params={{ id: s.host.id }} className="flex items-center gap-3">
              <Avatar><AvatarImage src={s.host.avatar_url ?? undefined} /><AvatarFallback>{s.host.display_name[0]}</AvatarFallback></Avatar>
              <div><p className="text-xs text-muted-foreground">Hosted by</p><p className="font-medium">{s.host.display_name}</p></div>
            </Link>
            <InstagramLink handle={s.host.instagram_handle} />
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <p className="font-display text-2xl font-semibold">{confirmed.length}/{s.capacity}</p>
          <p className="text-sm text-muted-foreground">spots filled{waitlist.length > 0 && ` · ${waitlist.length} waiting`}</p>
          <div className="mt-4">
            {mine ? (
              <>
                {myWait >= 0 && <p className="mb-3 rounded-md bg-warning px-3 py-2 text-sm text-warning-foreground">You're #{myWait + 1} on the waitlist.</p>}
                <Button variant="outline" className="w-full" onClick={leave}>{myWait >= 0 ? "Leave waitlist" : "Leave session"}</Button>
              </>
            ) : (
              <Button className="w-full" onClick={join}>{!user ? "Sign in to join" : full ? "Join waitlist" : "Join session"}</Button>
            )}
            {isHost && <Button variant="ghost" className="mt-2 w-full text-destructive" onClick={remove}>Delete session</Button>}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold">Going</h3>
          {confirmed.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No one yet.</p> : (
            <ul className="mt-1 divide-y">{confirmed.map((p) => <PersonRow key={p.user_id} p={p as Person} />)}</ul>
          )}
          {waitlist.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold">Waitlist</h3>
              <ul className="mt-1 divide-y">{waitlist.map((p) => <PersonRow key={p.user_id} p={p as Person} />)}</ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
