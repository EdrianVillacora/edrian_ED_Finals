# SETUP COMMANDS — QR Attendance App

> **Target:** First-year students | **Expo SDK:** 54 | **Expo Go:** 54.0.8

---

## PREREQUISITES

| Tool | Download | Verify |
|---|---|---|
| Node.js (LTS) | https://nodejs.org/en | `node --version` |
| VS Code | https://code.visualstudio.com | (open it) |
| Expo Go 54.0.8 | Play Store → "Expo Go" | (version in app settings) |

---

## STEP 1 — Create the App

```powershell
cd D:\QR-ATT
npx create-expo-app@latest qr-att

# When prompted, select "SDK 54"
# Wait for npm install (~2 min)
```

---

## STEP 2 — Install Matching Versions

The default install may need these fixed versions that match Expo Go 54.0.8:

```powershell
npm install expo@~54.0.35 react@19.1.0 react-native@0.81.5 expo-router@~6.0.24 @expo/vector-icons@^15.0.3 expo-linking@~8.0.12 expo-constants@~18.0.13 expo-font@~14.0.12 expo-status-bar@~3.0.9 expo-splash-screen@~31.0.13 react-native-screens@~4.16.0 react-native-safe-area-context@~5.6.0 react-native-gesture-handler@~2.28.0 react-native-reanimated@~4.1.1 react-dom@19.1.0 react-native-web@~0.21.0 @types/react@~19.1.0 typescript@~5.9.2 --legacy-peer-deps
```

---

## STEP 3 — Start

```powershell
npx expo start
```

Scan QR code with Expo Go. Or press `W` for web.

---

## TROUBLESHOOTING

| Problem | Solution |
|---|---|
| npm install fails | Use `npm install --legacy-peer-deps` |
| App crashes in Expo Go | Make sure all versions match STEP 2 exactly |
| QR won't scan | Phone + computer on same WiFi |
| White screen | Wait 10s, or shake → Reload |
| TypeScript errors | Run `npx tsc --noEmit` |


---

## NORMAL PHONE-CAMERA CHECK-IN (BROWSER PAGE)

The `app/attend.tsx` route provides a browser check-in page. The QR generator uses a legacy JSON payload until a public HTTPS web origin is configured. This keeps the existing in-app scanner usable while the web deployment is being prepared.

1. Copy `.env.example` to `.env` and fill in the existing Supabase URL and anon key.
2. Deploy the Expo web build to a static web host that supports Expo Router paths (for example, Netlify). Do not upload `.env` or any service-role key.
3. Set `EXPO_PUBLIC_ATTENDANCE_WEB_URL` to the deployed site's HTTPS origin, without a trailing slash. Example: `https://your-qr-attendance-site.netlify.app`.
4. Rebuild/redeploy the web app and restart/rebuild the mobile app so the public environment variable is included.
5. Generate a fresh event QR code. It will contain a URL like `https://your-site/attend?event=EVT-ABC123`.
6. Test from a separate phone: scan the QR with its normal camera, sign in with a student account, and tap **Record Attendance**.

Important:
- QR codes generated before the web URL is configured remain legacy JSON QR codes. Regenerate them after configuration for normal-camera check-in.
- The in-app scanner accepts both the old JSON payload and the new attendance URL.
- The browser page uses the existing Supabase authentication and attendance service. Database Row Level Security remains responsible for authorizing inserts.
- A public HTTPS deployment is required; the local development server is not accessible to students outside your network.


---

## Added dashboard features

- **Attendance Insights** — event and attendance totals based on rows readable through the current Supabase RLS policies.
- **QR-ATT — Live Monitor** — recent attendance records and Supabase Realtime inserts. Enable the `attendance` table in Supabase Database → Replication / Realtime, and make sure the signed-in teacher/admin can select the rows they need.
- **Event Reminders & Notifications** — upcoming events with date/countdown labels. On the web, browser notifications can be requested while the page is open. This is not a background push-notification service.
- **Attendance Achievements & Rewards** — milestones based on the signed-in student's attendance history.

## Deploy the web app to the existing Vercel project

1. Keep this project linked to your existing Vercel project. Do not create a new project if you want to keep the same URL.
2. Ensure the Vercel project's Environment Variables include `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for Production (and Preview if needed). Never add a Supabase service-role key to a browser app.
3. Run `npm install` and `npm run build` locally to verify the web export.
4. Commit and push the updated source to the Git branch connected to your existing Vercel project, or deploy this folder using the Vercel CLI while it is linked to that project.
5. Vercel will build the Expo web app into `dist` and publish it at the existing domain.

If a build fails, run `npm run typecheck` and review the first error before deploying.
