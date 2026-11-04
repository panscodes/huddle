import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Huddle" },
      { name: "description", content: "Create a Huddle account with email or Google to host and join community sports sessions." },
      { property: "og:title", content: "Sign up — Huddle" },
      { property: "og:description", content: "Create a Huddle account to start playing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="up" />,
});
