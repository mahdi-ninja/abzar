"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("localeSwitcher");
  const pathname = usePathname();
  const router = useRouter();

  function onChange(next: string | null) {
    if (!next) return;
    router.replace(pathname, { locale: next as Locale });
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger
        className="h-8 w-auto gap-1 rounded-md px-2 text-sm font-medium"
        aria-label={t("label")}
      >
        <span>{t(locale)}</span>
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {t(l)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
