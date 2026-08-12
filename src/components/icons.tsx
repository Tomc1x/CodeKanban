const common = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function RaysIcon() {
  return (
    <svg {...common} width={16} height={16}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function CrescentIcon() {
  return (
    <svg {...common} width={16} height={16}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="var(--color-accent)" />
      <path d="m8 12 3 3 5-6" stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CircleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-500)" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg {...common} style={{ verticalAlign: '-2px', marginRight: 4 }}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function ChecklistIcon() {
  return (
    <svg {...common} style={{ verticalAlign: '-2px', marginRight: 4 }}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg {...common} style={{ verticalAlign: '-2px', marginRight: 4 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...common}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...common} style={{ marginRight: 4 }}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function MinimizeIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <line x1="2" y1="6" x2="10" y2="6" />
    </svg>
  );
}

export function MaximizeIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <rect x="2" y="2" width="8" height="8" />
    </svg>
  );
}

export function RestoreIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <rect x="3.5" y="1.5" width="7" height="7" />
      <path d="M3.5 3.5H1.5v7h7v-2" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}
