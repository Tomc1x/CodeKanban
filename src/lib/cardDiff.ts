import { Card } from '../types';
import { COLUMNS } from './columns';

const LABEL: Record<string, string> = Object.fromEntries(COLUMNS.map((c) => [c.id, c.label]));

/**
 * Compare deux snapshots de cartes (avant/après un rechargement) et retourne les messages de
 * toast à afficher pour les changements pertinents : création, suppression, archivage, et
 * changement de statut. Couvre aussi bien les actions de l'utilisateur dans l'UI que les
 * modifications externes des fichiers `.md` (ex. par une IA), les deux passant par ce même
 * rechargement.
 */
export function describeCardChanges(prev: Card[], next: Card[]): string[] {
  const messages: string[] = [];
  const prevByFile = new Map(prev.map((c) => [c.filename, c]));
  const nextByFile = new Map(next.map((c) => [c.filename, c]));

  for (const card of next) {
    if (!prevByFile.has(card.filename)) messages.push(`Carte créée : ${card.title}`);
  }

  const removed = prev.filter((c) => !nextByFile.has(c.filename));
  const archived = removed.filter((c) => c.status === 'validated');
  const deleted = removed.filter((c) => c.status !== 'validated');
  if (archived.length === 1) messages.push('1 carte archivée');
  else if (archived.length > 1) messages.push(`${archived.length} cartes archivées`);
  for (const card of deleted) messages.push(`Carte supprimée : ${card.title}`);

  for (const card of next) {
    const before = prevByFile.get(card.filename);
    if (before && before.status !== card.status) {
      const fromLabel = LABEL[before.status] ?? before.status;
      const toLabel = LABEL[card.status] ?? card.status;
      messages.push(`${card.title} : ${fromLabel} → ${toLabel}`);
    }
  }

  return messages;
}
