import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">{t("message")}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-primary underline"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
