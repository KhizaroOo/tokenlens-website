import { AppHeader } from "@/components/layout/AppHeader";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader title={title} subtitle={subtitle} actions={actions} />
      <main className="flex-1 space-y-5 p-5 lg:p-6 animate-fade-up">{children}</main>
    </div>
  );
}
