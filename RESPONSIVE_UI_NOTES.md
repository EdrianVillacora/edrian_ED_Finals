# Responsive UI update — Presence Studio

This edition focuses on presentation and layout only. Supabase queries, login, QR payloads, event management, attendance rules, and routes have not been changed.

## Adjustments
- Compact dock icons, labels, padding, and launch control for small phone widths.
- Workspace navigator uses narrow margins, smaller cards and typography on compact screens; optional feature strip is omitted on short screens so menu items remain scrollable.
- Home hero, header, headline, quick stats, and margins reflow on narrow phones.
- Scanner viewfinder scales by available width and height instead of a fixed 250px square.
- Scanner result area keeps clear of the dock on compact phones.
- Login and registration cards use compact spacing and smaller top margins on short screens.
- Admin, teacher, insights, live monitor, reminders and rewards views use reduced side padding and extra bottom scroll space.

## Suggested smoke tests
Check widths of roughly 320, 360, 390, 430, and 600 logical pixels, including landscape and font enlargement. Verify login, QR camera permission and scanning, history, events, profile editing, and every role's navigation.

## Deployment
Run `npm ci`, `npm run typecheck`, and `npm run build` locally. Then verify `vercel project inspect` shows the intended project before running `vercel --prod`. Use the existing Supabase configuration; never commit `.env` or `.env.local`.
