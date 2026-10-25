# ATELIER / PRESENCE — UI Edition

This visual redesign removes the prior `AppDrawer` from the running layout. The new `StudioNavigation` is a persistent responsive navigation bar, showing only routes allowed for the user's role. Existing route names and all files inside `lib/` are preserved.

The home page has been redesigned as an editorial dashboard and all screen styling draws from the new slate / parchment / copper shared tokens.

## Deployment

Run `npm ci`, `npm run typecheck`, then `npm run build`. Confirm `vercel project inspect` identifies your intended project before `vercel --prod`. Keep your own `.env.local` on your machine; this package excludes credentials.
