import { UpdaterStatus } from '../types';

/**
 * Always points at whichever release is newest — a link to a specific
 * versioned asset (e.g. codekanban_0.3.1_amd64.deb) would go stale the
 * moment a new version ships.
 */
export const LATEST_RELEASE_URL = 'https://github.com/Tomc1x/CodeKanban/releases/latest';

export function describeUpdaterStatus(status: UpdaterStatus): string {
  switch (status.state) {
    case 'checking':
      return 'Vérification des mises à jour…';
    case 'available':
      return `Mise à jour ${status.version || ''} disponible — téléchargement…`;
    case 'downloading':
      return `Téléchargement… ${status.percent ?? 0}%`;
    case 'downloaded':
      return `Mise à jour ${status.version || ''} prête`;
    case 'unsupported':
      return 'Mise à jour automatique non disponible pour cette installation (.deb) — téléchargez la dernière version manuellement.';
    case 'error':
      return `Erreur de mise à jour${status.message ? ` : ${status.message}` : ''}`;
    case 'not-available':
    default:
      return 'Vous utilisez la dernière version.';
  }
}
