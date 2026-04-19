"use client";

import { useTranslations } from "next-intl";

import { NotFoundPage } from "@/components/not-found-page";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <NotFoundPage
      message={t("message")}
      action={(
        <Link href="/" className="inline-flex text-sm font-medium text-primary hover:underline">
          {t("goHome")}
        </Link>
      )}
    />
  );
}
