<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Waitlist is derived (first `capacity` participants by joined_at are confirmed), not stored, so leaving auto-promotes without triggers. Logic lives in src/lib/roster.ts.
- Maps use the Google Maps Embed iframe with the managed browser key; no server-side Maps calls.
