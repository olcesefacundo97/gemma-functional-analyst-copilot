import {
  BarChart3,
  Bug,
  ClipboardCheck,
  Code2,
  Copy,
  Download,
  FileJson,
  FileText,
  History,
  ListChecks,
  Moon,
  Presentation,
  Send,
  ShieldAlert,
  Sparkles,
  Sun,
  TicketCheck,
  Upload,
  Users,
  WandSparkles,
} from "lucide-react";

const icons = {
  BarChart3,
  Bug,
  ClipboardCheck,
  Code2,
  Copy,
  Download,
  FileJson,
  FileText,
  History,
  ListChecks,
  Moon,
  Presentation,
  Send,
  ShieldAlert,
  Sparkles,
  Sun,
  TicketCheck,
  Upload,
  Users,
  WandSparkles,
};

export type IconName = keyof typeof icons;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName | string; className?: string }) {
  const LucideIcon = icons[name as IconName] || Sparkles;
  return <LucideIcon className={className} aria-hidden="true" />;
}
