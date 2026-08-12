import { useEffect, useState } from 'react';
import type { SkillStatus } from '../types';

export default function InstallScreen() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SkillStatus | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    window.api.getSkillContent().then(setContent);
    window.api.getSkillStatus().then(setStatus);
  }, []);

  const install = async () => {
    setInstalling(true);
    try {
      setStatus(await window.api.installSkill());
    } finally {
      setInstalling(false);
    }
  };

  const statusLabel = !status
    ? 'Vérification…'
    : !status.installed
    ? 'Non installé'
    : status.upToDate
    ? 'Installé et à jour'
    : 'Installé — version différente de celle de l’app';

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>Configurer le skill IA</h1>
      <p style={{ opacity: 0.7, margin: '0 0 12px' }}>
        Ce client ne se connecte à aucun agent : il lit et écrit des fichiers Markdown dans le dossier du projet.
        Le skill ci-dessous apprend à votre agent (Claude Code) le format des cartes et les règles de lecture/écriture
        du tableau.
      </p>
      <p style={{ opacity: 0.7, margin: '0 0 16px' }}>Structure attendue dans le dossier du projet :</p>
      <pre style={{ fontFamily: 'ui-monospace,SF Mono,Menlo,monospace', fontSize: 13, background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)', padding: '12px 16px', margin: '0 0 16px', overflow: 'auto' }}>
{`.taskboard/
  001-ajouter-authentification-oauth.md
  002-corriger-bug-pagination-admin.md
  archive/2026-08-11/...`}
      </pre>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8, padding: '12px 16px', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{statusLabel}</div>
          {status && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{status.path}</div>}
        </div>
        <button type="button" className="btn btn-primary" onClick={install} disabled={installing || status?.upToDate}>
          {installing ? 'Installation…' : status?.installed ? 'Mettre à jour' : 'Installer le skill'}
        </button>
      </div>
      <p style={{ opacity: 0.6, fontSize: 12, margin: '0 0 20px' }}>
        Installe le skill globalement pour votre compte (dans <code>~/.claude/skills/codekanban/</code>) — il
        s'appliquera automatiquement à tout projet contenant un dossier <code>.taskboard/</code>, sans configuration
        par projet. Après l'installation, redémarrez Claude Code (ou lancez <code>/mcp</code> puis relancez la
        session) pour qu'il recharge la liste des skills disponibles.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55 }}>Contenu du skill installé</span>
      </div>
      <pre style={{ fontFamily: 'ui-monospace,SF Mono,Menlo,monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)', padding: 16, margin: 0, maxHeight: 400, overflow: 'auto' }}>
        {content}
      </pre>
    </main>
  );
}
