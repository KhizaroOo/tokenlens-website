import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-2.5 w-20 bg-muted" />
          <Skeleton className="h-8 w-28 bg-muted" />
          <Skeleton className="h-2.5 w-16 bg-muted" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl bg-muted flex-shrink-0" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <Skeleton className="h-3.5 w-full max-w-[100px] bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 px-4 pb-4" style={{ height }}>
      {[65, 40, 75, 55, 85, 45, 70, 50].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t bg-muted" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
