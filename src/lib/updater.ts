import { UpdaterStatus } from '../types';

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
      return 'Mise à jour automatique non disponible pour cette installation.';
    case 'error':
      return `Erreur de mise à jour${status.message ? ` : ${status.message}` : ''}`;
    case 'not-available':
    default:
      return 'Vous utilisez la dernière version.';
  }
}
