import type { Metadata } from "next";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "투닭",
  description: "말로 승부하고, 투표로 결정한다!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Applies a saved dark-mode preference (`.dark` on <html>, matching
            globals.css's `@custom-variant dark (&:is(.dark *))`) before the
            first paint — see node_modules/next/dist/docs/01-app/02-guides/
            preventing-flash-before-hydration.md. No toggle writes "theme" to
            localStorage yet (dark mode isn't wired up to any UI), so this is
            a no-op today but is ready for one. */}
        <script
          // React warns in dev whenever rendering produces a <script> tag —
          // toggling type to "text/plain" on the client (it never re-runs
          // there anyway; hard navigations already ran it during HTML
          // parsing) avoids that, per preventing-flash-before-hydration.md.
          type={
            typeof window === "undefined" ? "text/javascript" : "text/plain"
          }
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
