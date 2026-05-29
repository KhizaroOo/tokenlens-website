import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({ title, subtitle, actions, children, className, noPadding }: SectionCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-card card-shadow",
      className
    )}>
      {/* Top edge gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[13px] font-bold tracking-tight text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-2 ml-4">{actions}</div>}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-5")}>{children}</div>
    </div>
  );
}
