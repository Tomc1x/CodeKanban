import { useState } from 'react';
import { SKILL_TEXT } from '../lib/skillText';

export default function InstallScreen() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    window.api.copyToClipboard(SKILL_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>Configurer le skill IA</h1>
      <p style={{ opacity: 0.7, margin: '0 0 12px' }}>
        Ce client ne se connecte à aucun agent : il lit et écrit des fichiers Markdown dans le dossier du projet.
        Ajoutez le texte ci-dessous au skill ou prompt système de votre agent (Claude Code, ChatGPT CLI, ou autre)
        pour qu'il sache l'utiliser correctement.
      </p>
      <p style={{ opacity: 0.7, margin: '0 0 16px' }}>Structure attendue dans le dossier du projet :</p>
      <pre style={{ fontFamily: 'ui-monospace,SF Mono,Menlo,monospace', fontSize: 13, background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)', padding: '12px 16px', margin: '0 0 16px', overflow: 'auto' }}>
{`.taskboard/
  001-ajouter-authentification-oauth.md
  002-corriger-bug-pagination-admin.md
  archive/2026-08-11/...`}
      </pre>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55 }}>Texte à ajouter au skill</span>
        <button type="button" className="btn btn-secondary" onClick={copy}>{copied ? 'Copié ✓' : 'Copier'}</button>
      </div>
      <pre style={{ fontFamily: 'ui-monospace,SF Mono,Menlo,monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)', padding: 16, margin: 0 }}>
        {SKILL_TEXT}
      </pre>
    </main>
  );
}
