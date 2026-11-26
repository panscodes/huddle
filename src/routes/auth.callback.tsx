import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useUser } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    // Supabase passes session data in URL hash for OAuth callbacks
    // and query params for email confirmations
    const handleCallback = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes("access_token") || hash.includes("refresh_token"))) {
        // OAuth callback - Supabase JS client handles hash automatically
        // but we may need to clean up the URL
        const { error } = await supabase.auth.getSession();
        if (error) {
          toast.error("Sign in failed. Please try again.");
          navigate({ to: "/auth" });
          return;
        }
        // Clean up the hash from URL
        window.history.replaceState(null, "", window.location.pathname);
        navigate({ to: "/browse" });
        return;
      }

      // Email confirmation callback - check for confirmation params
      const urlParams = new URLSearchParams(window.location.search);
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

      // If user is already authenticated (e.g., redirected after OAuth), go to browse
      if (user) {
        navigate({ to: "/browse" });
        return;
      }

      // Otherwise just go to login
      navigate({ to: "/auth" });
    };

    handleCallback();
  }, [user, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Processing…</h1>
        <p className="mt-3 text-muted-foreground">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
