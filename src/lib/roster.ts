export type Participant = { user_id: string; joined_at: string };

/** First `capacity` people by join time are confirmed; the rest are on the waitlist. */
export function splitRoster<T extends Participant>(list: T[], capacity: number) {
  const sorted = [...list].sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  return { confirmed: sorted.slice(0, capacity), waitlist: sorted.slice(capacity) };
}

export function cleanInstagram(handle: string | null | undefined) {
  if (!handle) return null;
  const h = handle.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? h : null;
}
