import { useEffect, useState } from 'react';
import { MinimizeIcon, MaximizeIcon, RestoreIcon, CloseIcon } from './icons';
import UpdateIndicator from './UpdateIndicator';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.api.isWindowMaximized().then(setIsMaximized);
    return window.api.onWindowMaximizedChanged(setIsMaximized);
  }, []);

  const maximizeToggle = async () => {
    setIsMaximized(await window.api.maximizeToggleWindow());
  };

  return (
    <header className="title-bar" onDoubleClick={maximizeToggle}>
      <span className="title-bar-brand" onDoubleClick={(e) => e.stopPropagation()}>
        <span className="title-bar-dot" />
        CodeKanban
        <UpdateIndicator />
      </span>
      <div className="title-bar-controls" onDoubleClick={(e) => e.stopPropagation()}>
        <button type="button" className="title-bar-btn" title="Réduire" onClick={() => window.api.minimizeWindow()}>
          <MinimizeIcon />
        </button>
        <button type="button" className="title-bar-btn" title={isMaximized ? 'Restaurer' : 'Agrandir'} onClick={maximizeToggle}>
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button type="button" className="title-bar-btn title-bar-btn-close" title="Fermer" onClick={() => window.api.closeWindow()}>
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}
