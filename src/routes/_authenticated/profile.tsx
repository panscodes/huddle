import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanInstagram } from "@/lib/roster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — Huddle" }, { name: "description", content: "Edit your Huddle profile and social links." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState({ display_name: "", bio: "", instagram_handle: "" });
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (p) setForm({ display_name: p.display_name, bio: p.bio ?? "", instagram_handle: p.instagram_handle ?? "" });
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    const ig = form.instagram_handle.trim() ? cleanInstagram(form.instagram_handle) : null;
    if (form.instagram_handle.trim() && !ig) return toast.error("That Instagram handle doesn't look right.");
    const { error } = await supabase.from("profiles").upsert({ id: uid, display_name: form.display_name, bio: form.bio || null, instagram_handle: ig });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <div className="space-y-1.5"><Label>Display name</Label><Input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Sports you play, skill level…" /></div>
      <div className="space-y-1.5"><Label>Instagram</Label><Input value={form.instagram_handle} onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })} placeholder="@yourhandle" /></div>
      <Button>Save</Button>
    </form>
  );
}
