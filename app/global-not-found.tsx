import Link from "next/link";
import type { Metadata } from "next";

import "@/app/globals.css";

import { NotFoundPage } from "@/components/not-found-page";
import { routing } from "@/i18n/routing";
import { getLocaleFontVars } from "@/lib/locale-config";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html
      lang={routing.defaultLocale}
      dir="ltr"
      suppressHydrationWarning
      className={`${getLocaleFontVars(routing.defaultLocale)} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <NotFoundPage
          message="Page not found"
          action={(
            <Link
              href={`/${routing.defaultLocale}`}
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Go home
            </Link>
          )}
        />
      </body>
    </html>
  );
}
