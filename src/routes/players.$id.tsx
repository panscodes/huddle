import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstagramLink } from "@/components/InstagramLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/players/$id")({
  head: () => ({
    meta: [
      { title: "Player profile — Huddle" },
      { name: "description", content: "See this player's profile and social links on Huddle." },
      { property: "og:title", content: "Player profile — Huddle" },
      { property: "og:description", content: "A community player on Huddle." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["player", id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", id).maybeSingle()).data,
  });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!p) return <p>Player not found.</p>;
  return (
    <div className="mx-auto max-w-md text-center">
      <Avatar className="mx-auto h-24 w-24">
        <AvatarImage src={p.avatar_url ?? undefined} />
        <AvatarFallback className="text-2xl">{p.display_name[0]}</AvatarFallback>
      </Avatar>
      <h1 className="mt-4 text-3xl font-bold">{p.display_name}</h1>
      {p.bio && <p className="mt-3 text-muted-foreground">{p.bio}</p>}
      <div className="mt-4"><InstagramLink handle={p.instagram_handle} /></div>
    </div>
  );
}
