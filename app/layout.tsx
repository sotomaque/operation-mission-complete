import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPERATION: MISSION COMPLETE",
  description: "Classified briefing — eyes only.",
  // No favicon emoji shenanigans — keep the discovery surface dry so a
  // forwarded link preview doesn't accidentally spoil the surprise.
  robots: { index: false, follow: false },
};

/**
 * Viewport is set here (not as a `<meta>` in <head>) per Next.js 15+
 * convention — the framework injects the right tag from this export.
 * Without it, iOS Safari renders the page at desktop width and the
 * user pinch-zooms; with it, layout collapses to the device width and
 * our `sm:`-and-up responsive utility classes fire correctly.
 *
 * `themeColor` matches the dossier background so the mobile status bar
 * blends with the page instead of stranding a white strip up top.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1320",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Premium pairing: Pirata One (display, used only inside the
            adventure card), Special Elite (typewriter body / dossier
            text). Google Fonts; subset to display+swap so first paint
            doesn't FOUT badly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Pirata+One&family=Special+Elite&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
