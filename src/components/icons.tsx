import {
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Minus,
  Square,
  Copy,
  X,
  Download,
  FolderKanban,
  Settings,
  ChevronDown,
  Search,
  Sparkles,
  RotateCcw,
  BadgeCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

export function RaysIcon() {
  return <Sun size={16} strokeWidth={2} />;
}

export function CrescentIcon() {
  return <Moon size={16} strokeWidth={2} />;
}

export function CheckCircleIcon() {
  return <CheckCircle2 size={18} strokeWidth={2} color="var(--color-accent)" />;
}

export function CircleIcon() {
  return <Circle size={18} strokeWidth={2} color="var(--color-neutral-500)" />;
}

export function ClockIcon() {
  return <Clock size={14} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />;
}

export function ChecklistIcon() {
  return <ListChecks size={14} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />;
}

export function CommentIcon() {
  return <MessageSquare size={14} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />;
}

export function ArrowRightIcon() {
  return <ArrowRight size={12} strokeWidth={2} />;
}

export function PlusIcon() {
  return <Plus size={14} strokeWidth={2} />;
}

export function TrashIcon() {
  return <Trash2 size={14} strokeWidth={2} style={{ marginRight: 4 }} />;
}

export function MinimizeIcon() {
  return <Minus size={12} strokeWidth={1.5} />;
}

export function MaximizeIcon() {
  return <Square size={12} strokeWidth={1.5} />;
}

export function RestoreIcon() {
  return <Copy size={12} strokeWidth={1.5} />;
}

export function CloseIcon() {
  return <X size={12} strokeWidth={1.5} />;
}

export function DownloadIcon() {
  return <Download size={14} strokeWidth={2} />;
}

export function ProjectsIcon() {
  return <FolderKanban size={14} strokeWidth={2} />;
}

export function SettingsIcon() {
  return <Settings size={14} strokeWidth={2} />;
}

export function ArrowLeftIcon() {
  return <ArrowLeft size={14} strokeWidth={2} />;
}

export function ChevronDownIcon() {
  return <ChevronDown size={14} strokeWidth={2} />;
}

export function SearchIcon() {
  return <Search size={14} strokeWidth={2} />;
}

export function SparklesIcon() {
  return <Sparkles size={14} strokeWidth={2} color="var(--color-accent)" />;
}

export function RelaunchIcon() {
  return <RotateCcw size={14} strokeWidth={2} />;
}

export function ValidateIcon() {
  return <BadgeCheck size={14} strokeWidth={2} />;
}

export function CheckIcon() {
  return <Check size={14} strokeWidth={2} />;
}

export function HelpIcon() {
  return <HelpCircle size={16} strokeWidth={2} />;
}
