import { useEffect, useState } from 'react';
import { Card, ProjectSummary } from './types';
import Nav from './components/Nav';
import TitleBar from './components/TitleBar';
import RootScreen from './screens/RootScreen';
import BoardScreen from './screens/BoardScreen';
import InstallScreen from './screens/InstallScreen';
import CardPage from './components/CardPage';
import TutorialOverlay, { TutorialStep } from './components/TutorialOverlay';
import { ProjectsIcon, SettingsIcon, HelpIcon } from './components/icons';
import { ToastProvider } from './lib/toast';

type Screen = 'root' | 'board' | 'install';

const TUTORIAL_SEEN_KEY = 'codekanban:tutorial-seen';

type TutorialStepDef = TutorialStep & { screen: Screen; requiresProject?: boolean; demoCard?: boolean };

// Carte factice utilisée uniquement pour illustrer la colonne "Commentaires" pendant le
// tutoriel — jamais écrite sur disque (onChange/onDelete sont des no-op).
const TUTORIAL_DEMO_CARD: Card = {
  id: '000',
  status: 'doing',
  priority: 'moyenne',
  estimate: '',
  order: 10,
  wi: null,
  skills: [],
  dependsOn: [],
  askUserQuestions: null,
  refined: false,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  validatedAt: null,
  filename: '000-exemple.md',
  title: 'Exemple de carte',
  description: "Ceci est un exemple : la colonne de droite affiche le fil de commentaires, la vraie zone de dialogue avec l'IA.",
  checklist: [{ done: true, text: 'Comprendre le fil de commentaires' }],
  comments: [
    { author: 'user', time: '13/08 09:00', text: "Ajoute un bouton pour trier la liste par priorité." },
    {
      author: 'ia',
      time: '2026-08-13 09:05',
      text: "Fait : un bouton de tri par priorité a été ajouté en haut de la colonne. `tsc --noEmit` et les tests passent.",
    },
  ],
};

const ALL_TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    screen: 'install',
    targetSelector: '[data-tutorial="install-skill"]',
    title: 'Installer le skill IA',
    text: "Ce skill apprend à un agent IA (Claude Code, etc.) à lire et écrire les cartes de .taskboard/ directement sur disque. Sans lui, l'IA ne voit pas votre backlog : installez-le ici.",
  },
  {
    screen: 'install',
    targetSelector: null,
    title: 'Utiliser Claude Code avec CodeKanban',
    text: "CodeKanban n'appelle aucune IA lui-même : ouvrez un terminal dans le dossier du projet, lancez Claude Code (ou un autre agent compatible), puis demandez-lui de traiter le backlog (ex. « fait les tâches »). Il lit .taskboard/ directement grâce au skill installé, fait avancer vos cartes de colonne en colonne, et vous répond via les commentaires — pas d'API, pas de copier-coller.",
  },
  {
    screen: 'root',
    targetSelector: '[data-tutorial="add-root"]',
    title: 'Créer un projet',
    text: "Un projet correspond à un dossier local. Ajoutez-en un ici, puis ouvrez-le pour accéder à son tableau de suivi.",
  },
  {
    screen: 'board',
    requiresProject: true,
    targetSelector: '[data-tutorial="board-columns"]',
    title: 'Le cycle de vie d\'une carte',
    text: "Chaque carte avance dans 6 colonnes : Backlog et Validé sont réservées à vous, l'IA prend une carte en À faire, la passe En cours puis Terminé quand le travail et les tests passent, ou Bloqué si elle rencontre un obstacle.",
  },
  {
    screen: 'board',
    requiresProject: true,
    targetSelector: '[data-tutorial="add-card"]',
    title: 'Créer et remplir une carte',
    text: "Le bouton « + » de la colonne « À faire » crée une carte. Ouvrez-la pour écrire votre prompt/description, régler sa priorité, sa checklist, ses dépendances et le skill à appliquer.",
  },
  {
    screen: 'board',
    demoCard: true,
    targetSelector: '[data-tutorial="card-comments"]',
    title: "Dialoguer avec l'IA",
    text: "Une fois une carte ouverte, la colonne de droite affiche le fil de commentaires (exemple ci-contre). Écrivez-y une note pour l'IA (Entrée pour l'envoyer, Shift+Entrée pour un saut de ligne) : elle y répond avec son rapport ou ses questions.",
  },
  {
    screen: 'install',
    targetSelector: '[data-tutorial="project-settings"]',
    title: 'Réglages du projet',
    text: "Sur l'écran Configuration, choisissez le skill appliqué par défaut aux nouvelles cartes, si l'IA peut poser des questions de clarification, et la fréquence d'archivage de la colonne « Validé ».",
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('root');
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [allProjects, setAllProjects] = useState<ProjectSummary[]>([]);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStepDef[]>(ALL_TUTORIAL_STEPS);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.api.listRoots().then((roots) => {
      Promise.all(roots.map((r) => window.api.listProjects(r.id))).then((lists) => setAllProjects(lists.flat()));
    });
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) startTutorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTutorial = () => {
    // Les étapes nécessitant un projet ouvert (cycle de vie, création de carte, commentaires)
    // sont sautées si l'utilisateur n'a encore aucun projet configuré.
    const steps = allProjects.length > 0 ? ALL_TUTORIAL_STEPS : ALL_TUTORIAL_STEPS.filter((s) => !s.requiresProject);
    setTutorialSteps(steps);
    setTutorialStep(0);
    applyTutorialStep(steps[0]);
    setTutorialActive(true);
  };

  const applyTutorialStep = (stepDef: TutorialStepDef) => {
    if (stepDef.requiresProject && allProjects.length > 0) setProject(allProjects[0]);
    setScreen(stepDef.screen);
  };

  const goToTutorialStep = (index: number) => {
    setTutorialStep(index);
    applyTutorialStep(tutorialSteps[index]);
  };

  const finishTutorial = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setTutorialActive(false);
  };

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const openProject = (p: ProjectSummary) => {
    setProject(p);
    setScreen('board');
  };

  const backToRoot = () => {
    setProject(null);
    setScreen('root');
  };

  return (
    <ToastProvider>
      <div className="app-root">
        <TitleBar isDark={theme === 'dark'} />
        {(screen === 'root' || screen === 'install') && (
          <>
            <Nav isDark={theme === 'dark'} onToggleTheme={toggleTheme}>
              <a
                href="#"
                style={{ fontWeight: screen === 'root' ? 700 : 400 }}
                aria-current={screen === 'root' ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); setProject(null); setScreen('root'); }}
              >
                <ProjectsIcon />
                Projets
              </a>
              <a
                href="#"
                style={{ fontWeight: screen === 'install' ? 700 : 400 }}
                aria-current={screen === 'install' ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); setScreen('install'); }}
              >
                <SettingsIcon />
                Configuration
              </a>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                style={{ width: 28, height: 28 }}
                title="Revoir le tutoriel"
                onClick={startTutorial}
              >
                <HelpIcon />
              </button>
            </Nav>
            {screen === 'root' && <RootScreen onOpenProject={openProject} />}
            {screen === 'install' && <InstallScreen />}
          </>
        )}

        {screen === 'board' && project && (
          <BoardScreen
            project={project}
            allProjects={allProjects}
            isDark={theme === 'dark'}
            onToggleTheme={toggleTheme}
            onBackToRoot={backToRoot}
            onSwitchProject={openProject}
          />
        )}

        {tutorialActive && tutorialSteps[tutorialStep]?.demoCard && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1900,
              background: 'var(--color-bg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '10px 24px', fontSize: 12, opacity: 0.6, borderBottom: '2px solid var(--color-divider)' }}>
              Aperçu — cette carte n'est pas enregistrée
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <CardPage card={TUTORIAL_DEMO_CARD} allCards={[TUTORIAL_DEMO_CARD]} onChange={() => {}} onDelete={() => {}} />
            </div>
          </div>
        )}

        {tutorialActive && (
          <TutorialOverlay
            steps={tutorialSteps}
            step={tutorialStep}
            onNext={() => goToTutorialStep(tutorialStep + 1)}
            onPrev={() => goToTutorialStep(tutorialStep - 1)}
            onFinish={finishTutorial}
          />
        )}
      </div>
    </ToastProvider>
  );
}
