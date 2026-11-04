import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Huddle — Play together, nearby" },
      { name: "description", content: "Find and join pickup games and community sports sessions hosted by people near you." },
      { property: "og:title", content: "Huddle — Play together, nearby" },
      { property: "og:description", content: "Find and join pickup games and community sports sessions near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useUser();
  const navigate = useNavigate();

  if (user) {
    navigate({ to: "/browse" });
    return null;
  }

  return (
    <section className="relative -my-8 flex min-h-[calc(100dvh-4rem-200px)] flex-col items-center justify-center overflow-hidden text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 42%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />
      <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        Community sports meetups
      </p>
      <h1 className="mt-4 font-display text-7xl font-bold tracking-tight sm:text-8xl md:text-9xl">
        huddle<span className="text-primary">.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted-foreground">
        Find a game. Show up. Play. Huddle connects you with pickup sessions happening right around the corner — football, basketball, running clubs and more, hosted by people like you.
      </p>
      <Button asChild size="lg" className="mt-10 h-14 rounded-full px-10 text-base shadow-soft">
        <Link to="/browse">
          Jump right in
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        Free to join · No equipment needed · Just bring yourself
      </p>
    </section>
  );
}
