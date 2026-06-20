import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "danger" | "brand" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-line bg-bg text-text",
  success: "border-success/20 bg-success-soft text-success",
  danger: "border-danger/20 bg-danger-soft text-danger",
  brand: "border-line-strong bg-brand-soft text-brand-strong",
  muted: "border-line bg-bg-soft text-text-dim",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "typeui-badge inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
