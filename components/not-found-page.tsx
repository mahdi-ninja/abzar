import type { ReactNode } from "react";

interface NotFoundPageProps {
  message: string;
  action: ReactNode;
}

export function NotFoundPage({ message, action }: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <div className="mt-6">{action}</div>
      </div>
    </div>
  );
}
