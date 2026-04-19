import "@/app/globals.css";

import { ThemeScript } from "@/components/theme-script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full font-sans">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
