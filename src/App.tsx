import { useEffect, useState } from 'react';
import { ProjectSummary } from './types';
import Nav from './components/Nav';
import TitleBar from './components/TitleBar';
import RootScreen from './screens/RootScreen';
import BoardScreen from './screens/BoardScreen';
import InstallScreen from './screens/InstallScreen';

type Screen = 'root' | 'board' | 'install';

export default function App() {
  const [screen, setScreen] = useState<Screen>('root');
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    <div className="app-root">
      <TitleBar />
      {screen === 'root' && (
        <>
          <Nav isDark={theme === 'dark'} onToggleTheme={toggleTheme} />
          <RootScreen onOpenProject={openProject} />
        </>
      )}

      {screen !== 'root' && project && (
        <>
          <Nav isDark={theme === 'dark'} onToggleTheme={toggleTheme} onBrandClick={backToRoot} right={project.name}>
            <a href="#" onClick={(e) => { e.preventDefault(); backToRoot(); }}>← Projets</a>
            <a
              href="#"
              style={{ fontWeight: screen === 'board' ? 700 : 400 }}
              aria-current={screen === 'board' ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); setScreen('board'); }}
            >
              Tableau
            </a>
            <a
              href="#"
              style={{ fontWeight: screen === 'install' ? 700 : 400 }}
              aria-current={screen === 'install' ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); setScreen('install'); }}
            >
              Installation
            </a>
          </Nav>
          {screen === 'board' && <BoardScreen project={project} />}
          {screen === 'install' && <InstallScreen />}
        </>
      )}
    </div>
  );
}
