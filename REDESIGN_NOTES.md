# Presence Studio — visual redesign

This package is a **design-only restyling** of the uploaded QR_ATT_jimwell project. It adopts a graphite, citrus and mineral palette across shared components and routes. The existing navigation destinations, Supabase configuration calls, authentication functions, QR parsing, scanner callback, attendance validation, event handling, and role checks were not intentionally edited.

## Before deployment

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. Confirm the environment variables in Vercel: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_ATTENDANCE_WEB_URL`.
5. Use `vercel link` to select the correct project; `vercel --prod` to publish.
6. Smoke-test sign-in, registration, reset links, scanner permissions, QR link generation, attendance registration, teacher event management, and admin roles with a real Supabase project.

The visual update does not replace database SQL, add a new database, or verify production authentication or scanning.
