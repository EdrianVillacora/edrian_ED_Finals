# Password recovery fix

The Sign In page now has a **Forgot password?** link. The email is sent with a redirect to `/reset-password`, which allows the user to choose a new password and then return to Sign In.

## Supabase configuration
- Site URL: `https://qr-attendance-ten-jade.vercel.app`
- Additional Redirect URL: `https://qr-attendance-ten-jade.vercel.app/**`
- Supabase email templates should preserve the recovery verification link (default `{{ .ConfirmationURL }}`).

## Deploy to Vercel
From the project directory, with the existing Vercel project linked and its Supabase environment variables configured:

```powershell
npm install
vercel --prod
```

Request a **new** password recovery email after deployment. Old links might point to the old route. You must use a real web browser to verify the full flow against your Supabase project; no live Supabase credentials are included in this ZIP.
