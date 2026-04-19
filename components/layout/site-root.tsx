import { NextIntlClientProvider } from "next-intl";

import { AppShell } from "@/components/layout/app-shell";
import { PwaProvider } from "@/components/pwa-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function SiteRoot({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <PwaProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </TooltipProvider>
        </PwaProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
