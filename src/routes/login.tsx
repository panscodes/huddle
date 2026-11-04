import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Huddle" },
      { name: "description", content: "Log in to your Huddle account with email or Google to join sessions." },
      { property: "og:title", content: "Log in — Huddle" },
      { property: "og:description", content: "Log in to join community sports sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="in" />,
});
