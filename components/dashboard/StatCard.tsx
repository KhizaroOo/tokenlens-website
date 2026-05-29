import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-emerald-400",
  iconBg = "bg-emerald-500/10",
}: StatCardProps) {
  const ChangeIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus;

  return (
    <div className="stat-card group relative overflow-hidden rounded-2xl border border-border bg-card p-5 card-shadow transition-all duration-300 hover:-translate-y-0.5">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            {label}
          </p>
          <p className="stat-value mt-2 text-[28px] font-bold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <ChangeIcon className={cn(
                "h-3 w-3 flex-shrink-0",
                changeType === "positive" && "text-emerald-500",
                changeType === "negative" && "text-red-400",
                changeType === "neutral" && "text-muted-foreground"
              )} />
              <p className={cn(
                "text-[11px] font-semibold",
                changeType === "positive" && "text-emerald-500",
                changeType === "negative" && "text-red-400",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "flex-shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110",
            iconBg
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
