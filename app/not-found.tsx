import Link from "next/link";

import { NotFoundPage } from "@/components/not-found-page";
import { routing } from "@/i18n/routing";

export default function GlobalNotFound() {
  return (
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
  );
}
