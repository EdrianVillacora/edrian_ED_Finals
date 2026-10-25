import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// This file only runs when the website is built (npx expo export -p web).
// It controls the page shell that every screen sits inside on the web.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* No "viewport-fit=cover" and no zoom lock: keeps pinch-zoom for accessibility. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111A24" />

        {/* Expo's standard reset: the page itself does not scroll; each screen's ScrollView does. */}
        <ScrollViewStyleReset />

        {/* Phone smoothness fixes, applied on top of the reset. */}
        <style dangerouslySetInnerHTML={{ __html: phoneCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const phoneCss = `
/* Stop the "pull down to refresh" and rubber-band bounce from fighting the
   scrolling inside the app. */
html, body { overscroll-behavior: none; }

/* Dark background behind everything, so there is no white flash while scrolling or loading. */
body {
  background-color: #111A24;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  /* Allows scrolling and pinch-zoom, but removes the double-tap-to-zoom jump on buttons. */
  touch-action: manipulation;
}

/* "100%" is taller than the visible area on phones because the browser's address bar
   covers part of it, which cuts off the bottom of the page. "dvh" follows the
   visible area as the address bar and keyboard move. */
@supports (height: 100dvh) {
  #root { height: 100dvh; }
}
`;