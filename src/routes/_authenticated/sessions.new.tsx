import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MapEmbed } from "@/components/MapEmbed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/sessions/new")({
  head: () => ({ meta: [{ title: "Host a session — Huddle" }, { name: "description", content: "Set up a new community sports session." }] }),
  component: NewSession,
});

function NewSession() {
  const navigate = useNavigate();
  const [f, setF] = useState({ title: "", sport: "", description: "", starts_at: "", duration_minutes: 90, location_name: "", address: "", capacity: 10 });
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("sessions").insert({
      ...f,
      host_id: u.user!.id,
      starts_at: new Date(f.starts_at).toISOString(),
      duration_minutes: Number(f.duration_minutes),
      capacity: Number(f.capacity),
      description: f.description || null,
      address: f.address || null,
    }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    await supabase.from("participants").insert({ session_id: data.id, user_id: u.user!.id });
    navigate({ to: "/sessions/$id", params: { id: data.id } });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">Host a session</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2"><Label>Title</Label><Input required value={f.title} onChange={set("title")} placeholder="Saturday morning 5-a-side" /></div>
        <div className="space-y-1.5"><Label>Sport</Label><Input required value={f.sport} onChange={set("sport")} placeholder="Football" /></div>
        <div className="space-y-1.5"><Label>Starts at</Label><Input type="datetime-local" required value={f.starts_at} onChange={set("starts_at")} /></div>
        <div className="space-y-1.5"><Label>Duration (min)</Label><Input type="number" min={15} required value={f.duration_minutes} onChange={set("duration_minutes")} /></div>
        <div className="space-y-1.5"><Label>Player limit</Label><Input type="number" min={1} required value={f.capacity} onChange={set("capacity")} /></div>
        <div className="space-y-1.5"><Label>Venue name</Label><Input required value={f.location_name} onChange={set("location_name")} onBlur={() => setPreview([f.location_name, f.address].filter(Boolean).join(", "))} placeholder="Victoria Park" /></div>
        <div className="space-y-1.5"><Label>Address</Label><Input value={f.address} onChange={set("address")} onBlur={() => setPreview([f.location_name, f.address].filter(Boolean).join(", "))} placeholder="Street, city" /></div>
      </div>
      {preview && <MapEmbed query={preview} />}
      <div className="space-y-1.5"><Label>Details</Label><Textarea rows={4} value={f.description} onChange={set("description")} placeholder="Skill level, what to bring, cost…" /></div>
      <p className="text-xs text-muted-foreground">Once full, new players join a waitlist and move up automatically if someone leaves.</p>
      <Button disabled={busy}>Publish session</Button>
    </form>
  );
}
