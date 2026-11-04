import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in — Huddle" },
      { name: "description", content: "Log in or create a Huddle account to host and join sports sessions." },
      { property: "og:title", content: "Log in — Huddle" },
      { property: "og:description", content: "Log in to host and join community sports sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="in" />,
});
