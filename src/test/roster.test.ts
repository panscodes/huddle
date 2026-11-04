import { describe, it, expect } from "vitest";
import { splitRoster, cleanInstagram } from "@/lib/roster";

const p = (id: string, t: string) => ({ user_id: id, joined_at: t });

describe("roster", () => {
  it("puts people beyond capacity on the waitlist in join order", () => {
    const r = splitRoster([p("c", "2026-01-03"), p("a", "2026-01-01"), p("b", "2026-01-02")], 2);
    expect(r.confirmed.map((x) => x.user_id)).toEqual(["a", "b"]);
    expect(r.waitlist.map((x) => x.user_id)).toEqual(["c"]);
  });
  it("promotes the first waitlisted person when someone leaves", () => {
    const r = splitRoster([p("b", "2026-01-02"), p("c", "2026-01-03")], 2);
    expect(r.confirmed.map((x) => x.user_id)).toEqual(["b", "c"]);
    expect(r.waitlist).toHaveLength(0);
  });
  it("normalizes instagram handles", () => {
    expect(cleanInstagram("@run.club")).toBe("run.club");
    expect(cleanInstagram("https://instagram.com/run_club/")).toBe("run_club");
    expect(cleanInstagram("bad handle!")).toBeNull();
  });
});
