import { useEffect, useState } from 'react';
import type { ProjectSettings, ProjectSummary, SkillStatus, UpdaterStatus } from '../types';
import { describeUpdaterStatus, LATEST_RELEASE_URL } from '../lib/updater';

export default function InstallScreen() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SkillStatus | null>(null);
  const [installing, setInstalling] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdaterStatus>({ state: 'not-available' });

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings | null>(null);

  useEffect(() => {
    window.api.getSkillContent().then(setContent);
    window.api.getSkillStatus().then(setStatus);
    window.api.listAvailableSkills().then(setAvailableSkills);
    window.api.listRoots().then((roots) => {
      Promise.all(roots.map((r) => window.api.listProjects(r.id))).then((lists) => {
        const all = lists.flat();
        setProjects(all);
        if (all.length > 0) setSelectedProject((cur) => cur || all[0].path);
      });
    });
    return window.api.onUpdaterStatus(setUpdateStatus);
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    window.api.getProjectSettings(selectedProject).then(setProjectSettings);
  }, [selectedProject]);

  const updateProjectSettings = (patch: Partial<ProjectSettings>) => {
    if (!selectedProject) return;
    window.api.setProjectSettings(selectedProject, patch).then(setProjectSettings);
  };

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
      <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>Configuration</h1>
      <p style={{ opacity: 0.7, margin: '0 0 12px' }}>
        Ce client ne se connecte à aucun agent : il lit et écrit des fichiers Markdown dans le dossier du projet.
        Le skill ci-dessous apprend à votre agent (Claude Code) le format des cartes et les règles de lecture/écriture
        du tableau.
      </p>

      {projects.length > 0 && (
        <div
          data-tutorial="project-settings"
          style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)' }}
        >
          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 10 }}>
            Réglages du projet
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Projet</label>
            <select className="input" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              {projects.map((p) => (
                <option key={p.path} value={p.path}>{p.name}</option>
              ))}
            </select>
          </div>

          {projectSettings && (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Skill appliqué par défaut aux nouvelles cartes</label>
                <select
                  className="input"
                  value={projectSettings.defaultSkill ?? ''}
                  onChange={(e) => updateProjectSettings({ defaultSkill: e.target.value || null })}
                >
                  <option value="">Aucun</option>
                  {availableSkills.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={projectSettings.askUserQuestionsDefault}
                  onChange={(e) => updateProjectSettings({ askUserQuestionsDefault: e.target.checked })}
                />
                Autoriser l'IA à poser des questions de clarification (AskUserQuestions) par défaut
              </label>

              <div className="field">
                <label>Archivage automatique de la colonne « Validé »</label>
                <select
                  className="input"
                  value={projectSettings.archiveFrequency}
                  onChange={(e) => updateProjectSettings({ archiveFrequency: e.target.value as ProjectSettings['archiveFrequency'] })}
                >
                  <option value="never">Jamais</option>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

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
        <button type="button" data-tutorial="install-skill" className="btn btn-primary" onClick={install} disabled={installing || status?.upToDate}>
          {installing ? 'Installation…' : status?.installed ? 'Mettre à jour' : 'Installer le skill'}
        </button>
      </div>
      <p style={{ opacity: 0.6, fontSize: 12, margin: '0 0 20px' }}>
        Installe le skill globalement pour votre compte (dans <code>~/.claude/skills/codekanban/</code>) — il
        s'appliquera automatiquement à tout projet contenant un dossier <code>.taskboard/</code>, sans configuration
        par projet. Après l'installation, redémarrez Claude Code (ou lancez <code>/mcp</code> puis relancez la
        session) pour qu'il recharge la liste des skills disponibles.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)' }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 4 }}>Mises à jour</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{describeUpdaterStatus(updateStatus)}</div>
          {updateStatus.state === 'unsupported' && (
            <a
              href="#"
              style={{ fontSize: 12 }}
              onClick={(e) => {
                e.preventDefault();
                window.api.openExternal(LATEST_RELEASE_URL);
              }}
            >
              Télécharger la dernière version (.deb) sur GitHub →
            </a>
          )}
        </div>
        {updateStatus.state === 'downloaded' ? (
          <button type="button" className="btn btn-primary" onClick={() => window.api.restartAndInstallUpdate()}>
            Redémarrer maintenant
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.api.checkForUpdates()}
            disabled={updateStatus.state === 'checking' || updateStatus.state === 'downloading'}
          >
            Vérifier les mises à jour
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55 }}>Contenu du skill installé</span>
      </div>
      <pre style={{ fontFamily: 'ui-monospace,SF Mono,Menlo,monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--color-neutral-100)', border: '2px solid var(--color-divider)', padding: 16, margin: 0, maxHeight: 400, overflow: 'auto' }}>
        {content}
      </pre>
    </main>
  );
}
