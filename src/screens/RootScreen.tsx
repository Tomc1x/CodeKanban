import { useEffect, useState } from 'react';
import { ProjectSummary, RootConfig } from '../types';
import { PlusIcon, SearchIcon } from '../components/icons';

interface RootScreenProps {
  onOpenProject: (project: ProjectSummary) => void;
}

export default function RootScreen({ onOpenProject }: RootScreenProps) {
  const [roots, setRoots] = useState<RootConfig[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [query, setQuery] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRootId, setNewProjectRootId] = useState('');
  const [createError, setCreateError] = useState('');

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

  const openAddProject = () => {
    setNewProjectName('');
    setCreateError('');
    setNewProjectRootId(roots[0]?.id ?? '');
    setShowAddProject(true);
  };

  const createProject = () => {
    const rootId = newProjectRootId || roots[0]?.id;
    if (!rootId) return;
    window.api.createProject(rootId, newProjectName).then(
      (project) => {
        setShowAddProject(false);
        reloadProjects(roots);
        onOpenProject(project);
      },
      (err) => setCreateError(err instanceof Error ? err.message : String(err))
    );
  };

  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 16px', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Vos projets</h1>
      <p style={{ opacity: 0.65, maxWidth: '60ch', margin: '0 0 16px' }}>
        Sélectionnez un projet pour ouvrir son tableau de suivi. Chaque projet correspond à un dossier local piloté par l'IA via des fichiers Markdown.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button type="button" data-tutorial="add-root" className="btn btn-secondary" onClick={addRoot}>Ajouter un dossier racine</button>
        <button
          type="button"
          data-tutorial="add-project"
          className="btn btn-primary"
          onClick={openAddProject}
          disabled={roots.length === 0}
        >
          <PlusIcon />
          Nouveau projet
        </button>
        {roots.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun dossier racine configuré.</span>}
      </div>

      {showAddProject && (
        <div className="dialog-backdrop" onClick={() => setShowAddProject(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Nouveau projet</div>
            <div className="field">
              <label>Nom du projet</label>
              <input
                autoFocus
                className="input"
                placeholder="Ex. site-vitrine-client"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createProject()}
              />
            </div>
            {roots.length > 1 && (
              <div className="field">
                <label>Dossier racine</label>
                <select
                  className="input"
                  value={newProjectRootId}
                  onChange={(e) => setNewProjectRootId(e.target.value)}
                >
                  {roots.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
            {createError && <div style={{ color: 'var(--color-accent)', fontSize: 13 }}>{createError}</div>}
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddProject(false)}>Annuler</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={createProject}
                disabled={!newProjectName.trim()}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

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

      {projects.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, maxWidth: 360 }}>
          <SearchIcon />
          <input
            className="input"
            placeholder="Rechercher un projet…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="project-grid">
        {projects
          .filter((proj) => proj.name.toLowerCase().includes(query.trim().toLowerCase()))
          .map((proj) => (
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
