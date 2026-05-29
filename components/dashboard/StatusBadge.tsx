import { cn } from "@/lib/utils";

type Status = "connected" | "not_connected" | "failed" | "disabled" | "active" | "inactive" | "warning";

const cfg: Record<Status, { label: string; dot: string; cls: string }> = {
  connected:     { label: "Connected",     dot: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.7)]", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  not_connected: { label: "Not Connected", dot: "bg-slate-500",                                         cls: "bg-muted text-muted-foreground border-border"             },
  failed:        { label: "Failed",        dot: "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.7)]",     cls: "bg-red-500/10 text-red-400 border-red-500/20"             },
  disabled:      { label: "Disabled",      dot: "bg-slate-600",                                         cls: "bg-muted text-muted-foreground/60 border-border"          },
  active:        { label: "Active",        dot: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.7)]", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  inactive:      { label: "Inactive",      dot: "bg-slate-500",                                         cls: "bg-muted text-muted-foreground border-border"             },
  warning:       { label: "Warning",       dot: "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.7)]",  cls: "bg-amber-500/10 text-amber-500 border-amber-500/20"       },
};

interface StatusBadgeProps { status: Status; label?: string; }

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const c = cfg[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
      c.cls
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", c.dot)} />
      {label ?? c.label}
    </span>
  );
}
