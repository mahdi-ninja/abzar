import { cn } from "@/lib/utils";

interface ResultBadgeProps {
  status: "pass" | "fail" | "warning" | "info";
  label: string;
  className?: string;
}

const statusStyles: Record<ResultBadgeProps["status"], string> = {
  pass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  fail: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export function ResultBadge({ status, label, className }: ResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
