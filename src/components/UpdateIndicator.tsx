import { useEffect, useRef, useState } from 'react';
import { UpdaterStatus } from '../types';
import { describeUpdaterStatus } from '../lib/updater';
import { DownloadIcon } from './icons';

export default function UpdateIndicator() {
  const [status, setStatus] = useState<UpdaterStatus>({ state: 'not-available' });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => window.api.onUpdaterStatus(setStatus), []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (status.state === 'not-available' || status.state === 'unsupported') return null;

  const isError = status.state === 'error';
  const isDownloaded = status.state === 'downloaded';

  const label = describeUpdaterStatus(status);

  return (
    <div ref={rootRef} className="title-bar-update" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        className="title-bar-btn"
        title={label}
        onClick={() => (isDownloaded || isError) && setOpen((o) => !o)}
        style={{ width: 32, color: isError ? 'var(--color-accent)' : undefined }}
      >
        <DownloadIcon />
      </button>
      {open && (
        <div
          className="dialog elev-md"
          style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 260, padding: 12, zIndex: 20 }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>{label}</p>
          {isDownloaded && (
            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => window.api.restartAndInstallUpdate()}>
              Redémarrer maintenant
            </button>
          )}
        </div>
      )}
    </div>
  );
}
