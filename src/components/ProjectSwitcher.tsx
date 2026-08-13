import { useEffect, useRef, useState } from 'react';
import { ProjectSummary } from '../types';
import { ChevronDownIcon, SearchIcon } from './icons';

interface ProjectSwitcherProps {
  current: ProjectSummary;
  projects: ProjectSummary[];
  onSelect: (project: ProjectSummary) => void;
}

export default function ProjectSwitcher({ current, projects, onSelect }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        onClick={() => {
          setOpen((v) => !v);
          setQuery('');
        }}
      >
        {current.name}
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          className="elev-md"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 280,
            background: 'var(--color-surface)',
            border: '2px solid var(--color-divider)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '2px solid var(--color-divider)' }}>
            <SearchIcon />
            <input
              autoFocus
              className="input"
              style={{ border: 'none', padding: '4px 0' }}
              placeholder="Rechercher un projet…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filtered.map((p) => (
              <button
                key={p.path}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: p.path === current.path ? 'var(--color-neutral-100)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: p.path === current.path ? 700 : 400,
                  color: 'inherit',
                }}
              >
                {p.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-muted" style={{ padding: 12, fontSize: 13 }}>Aucun projet trouvé.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
