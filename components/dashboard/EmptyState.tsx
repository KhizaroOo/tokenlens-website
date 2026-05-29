import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      {Icon && (
        <div className="relative mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted">
            <Icon className="h-7 w-7 text-muted-foreground/50" />
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
        </div>
      )}
      <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm font-medium text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
