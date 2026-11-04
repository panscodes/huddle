import { Instagram } from "lucide-react";
import { cleanInstagram } from "@/lib/roster";

export function InstagramLink({ handle, compact }: { handle: string | null | undefined; compact?: boolean }) {
  const h = cleanInstagram(handle);
  if (!h) return null;
  return (
    <a
      href={`https://instagram.com/${h}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      onClick={(e) => e.stopPropagation()}
    >
      <Instagram className="h-4 w-4" />
      {!compact && <span>@{h}</span>}
    </a>
  );
}
