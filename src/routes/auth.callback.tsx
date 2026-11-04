import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const fromHash = hash.includes("access_token") || hash.includes("refresh_token") || hash.includes("id_token");
      const fromQuery = urlParams.get("code") || urlParams.get("error") || urlParams.get("token_hash");

      // Handle OAuth callback (Google, etc.) - Supabase passes tokens in hash or query params
      if (fromHash || fromQuery) {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          toast.error("Sign in failed. Please try again.");
          navigate({ to: "/auth" });
          return;
        }
        // Clean up the hash and query params from URL
        const url = new URL(window.location.origin + window.location.pathname);
        window.history.replaceState(null, "", url);
        navigate({ to: "/browse" });
        return;
      }

      // Handle email confirmation / invite callbacks via query params
      const type = urlParams.get("type");
      const tokenHash = urlParams.get("token_hash");

      if (type === "signup" && tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "signup",
        });
        if (error) {
          toast.error("Email confirmation failed. Please try again.");
          navigate({ to: "/auth" });
          return;
        }
        toast.success("Email confirmed! You can now sign in.");
        window.history.replaceState(null, "", window.location.pathname);
        navigate({ to: "/auth" });
        return;
      }

      if (type === "invite" && tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "invite",
        });
        if (error) {
          toast.error("Invitation acceptance failed. Please try again.");
          navigate({ to: "/auth" });
          return;
        }
        toast.success("Invitation accepted!");
        window.history.replaceState(null, "", window.location.pathname);
        navigate({ to: "/browse" });
        return;
      }

      // Fallback: check if there's an existing session (e.g. page refresh on callback)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.history.replaceState(null, "", window.location.pathname);
        navigate({ to: "/browse" });
        return;
      }

      // Otherwise just go to login
      navigate({ to: "/auth" });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Processing…</h1>
        <p className="mt-3 text-muted-foreground">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
