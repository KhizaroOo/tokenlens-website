/**
 * Type stubs for packages that ship without bundled TypeScript declarations.
 *
 * lucide-react 1.14.0 does not include .d.ts files. Declaring the module here
 * lets TypeScript resolve every named import. Runtime behaviour is unchanged —
 * all icons exist in the JS bundle. Delete this file if lucide-react adds
 * declarations in a future release.
 */
declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  };

  export type LucideIcon = FC<LucideProps>;

  // ── Every icon imported across this codebase (exhaustive grep scan) ─────────
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertOctagon: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const BellRing: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Bot: LucideIcon;
  export const BrainCircuit: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building2: LucideIcon;
  export const Calculator: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Clock: LucideIcon;
  export const Code2: LucideIcon;
  export const Compass: LucideIcon;
  export const Cpu: LucideIcon;
  export const Crosshair: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileBarChart: LucideIcon;
  export const FileSearch: LucideIcon;
  export const FileText: LucideIcon;
  export const GitBranch: LucideIcon;
  export const GitCommit: LucideIcon;
  export const GitCompare: LucideIcon;
  export const GitPullRequest: LucideIcon;
  export const Handshake: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const History: LucideIcon;
  export const Info: LucideIcon;
  export const KeyRound: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Layers: LucideIcon;
  export const LifeBuoy: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const ListChecks: LucideIcon;
  export const Loader2: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const Mic: LucideIcon;
  export const Minus: LucideIcon;
  export const Moon: LucideIcon;
  export const Network: LucideIcon;
  export const PieChart: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Server: LucideIcon;
  export const ServerCog: LucideIcon;
  export const Settings: LucideIcon;
  export const Settings2: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Sun: LucideIcon;
  export const Target: LucideIcon;
  export const Terminal: LucideIcon;
  export const ToggleLeft: LucideIcon;
  export const ToggleRight: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const User: LucideIcon;
  export const UserCheck: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const UsersRound: LucideIcon;
  export const Wallet: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;
}
