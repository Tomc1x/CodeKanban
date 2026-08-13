import { Card, Status } from '../types';

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

/**
 * In the "todo" column, a card can't be positioned before its own dependencies, nor after a
 * card that depends on it (both still being tracked while in "todo"). Returns the allowed
 * insertion-index range [min, max] within `colCards` (which must exclude the dragged card).
 */
export function getDependencyBounds(draggingCard: Card, colCards: Card[]): { min: number; max: number } {
  const depPositions = draggingCard.dependsOn
    .map((depId) => colCards.findIndex((c) => c.id === depId))
    .filter((i) => i >= 0);
  const min = depPositions.length ? Math.max(...depPositions) + 1 : 0;

  const dependentPositions = colCards
    .map((c, i) => (c.dependsOn.includes(draggingCard.id) ? i : -1))
    .filter((i) => i >= 0);
  const max = dependentPositions.length ? Math.min(...dependentPositions) : colCards.length;

  return { min, max };
}
