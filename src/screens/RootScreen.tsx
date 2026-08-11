import { useEffect, useState } from 'react';
import { ProjectSummary, RootConfig } from '../types';

interface RootScreenProps {
  onOpenProject: (project: ProjectSummary) => void;
}

export default function RootScreen({ onOpenProject }: RootScreenProps) {
  const [roots, setRoots] = useState<RootConfig[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  const reloadProjects = (currentRoots: RootConfig[]) => {
    Promise.all(currentRoots.map((r) => window.api.listProjects(r.id))).then((lists) => {
      setProjects(lists.flat());
    });
  };

  useEffect(() => {
    window.api.listRoots().then((r) => {
      setRoots(r);
      reloadProjects(r);
    });
  }, []);

  const addRoot = () => {
    window.api.addRoot().then((r) => {
      setRoots(r);
      reloadProjects(r);
    });
  };

  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 16px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Vos projets</h1>
      <p style={{ opacity: 0.65, maxWidth: '60ch', margin: '0 0 16px' }}>
        Sélectionnez un projet pour ouvrir son tableau de suivi. Chaque projet correspond à un dossier local piloté par l'IA via des fichiers Markdown.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" className="btn btn-primary" onClick={addRoot}>Ajouter un dossier racine</button>
        {roots.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun dossier racine configuré.</span>}
      </div>

      {roots.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roots.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span className="tag tag-neutral">{r.name}</span>
              <span className="text-muted">{r.path}</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => window.api.removeRoot(r.id).then((updated) => { setRoots(updated); reloadProjects(updated); })}
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="project-grid">
        {projects.map((proj) => (
          <div key={proj.path} className="card elev-sm" style={{ cursor: 'pointer' }} onClick={() => onOpenProject(proj)}>
            <div className="card-kicker">{proj.path}</div>
            <div className="card-title">{proj.name}</div>
            <div className="card-meta">
              <span>
                {proj.activeCount} tâches actives · {proj.totalCount} au total
                {proj.blockedCount > 0 && <> · <span style={{ color: 'var(--color-accent)' }}>{proj.blockedCount} bloquée{proj.blockedCount > 1 ? 's' : ''}</span></>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
