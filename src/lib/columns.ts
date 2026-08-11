import { Status } from '../types';

export interface ColumnMeta {
  id: Status;
  label: string;
  aiReadable: boolean;
  showAddGhost: boolean;
}

export const COLUMNS: ColumnMeta[] = [
  { id: 'backlog', label: 'Backlog', aiReadable: false, showAddGhost: true },
  { id: 'todo', label: 'À faire', aiReadable: true, showAddGhost: true },
  { id: 'doing', label: 'En cours', aiReadable: true, showAddGhost: false },
  { id: 'blocked', label: 'Bloqué', aiReadable: true, showAddGhost: false },
  { id: 'done', label: 'Terminé', aiReadable: false, showAddGhost: false },
  { id: 'validated', label: 'Validé', aiReadable: false, showAddGhost: false },
];

export function nextColumn(status: Status): Status | null {
  const idx = COLUMNS.findIndex((c) => c.id === status);
  return idx >= 0 && idx + 1 < COLUMNS.length ? COLUMNS[idx + 1].id : null;
}

export const PRIORITY_CLASS: Record<string, string> = {
  haute: 'tag tag-accent',
  moyenne: 'tag tag-outline',
  basse: 'tag tag-neutral',
};
