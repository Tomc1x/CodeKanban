import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Card, ProjectSummary, Status } from '../types';
import { COLUMNS, PRIORITY_CLASS, getDependencyBounds, nextColumn } from '../lib/columns';
import Column from '../components/Column';
import CardPage from '../components/CardPage';
import Nav from '../components/Nav';
import ProjectSwitcher from '../components/ProjectSwitcher';
import { ArrowLeftIcon, CheckIcon, SparklesIcon } from '../components/icons';

interface BoardScreenProps {
  project: ProjectSummary;
  allProjects: ProjectSummary[];
  isDark: boolean;
  onToggleTheme: () => void;
  onBackToRoot: () => void;
  onSwitchProject: (project: ProjectSummary) => void;
}

export default function BoardScreen({ project, allProjects, isDark, onToggleTheme, onBackToRoot, onSwitchProject }: BoardScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [openFilename, setOpenFilename] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Card | null>(null);
  const [confirmArchiveAll, setConfirmArchiveAll] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [focusTitleFor, setFocusTitleFor] = useState<string | null>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout>>();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const loadCards = useCallback(() => {
    window.api.readCards(project.path).then(setCards);
  }, [project.path]);

  useEffect(() => {
    loadCards();
    window.api.watchProject(project.path);
    const unsubscribe = window.api.onCardsChanged((changedPath) => {
      if (changedPath === project.path) loadCards();
    });
    return () => {
      unsubscribe();
      window.api.unwatchProject();
    };
  }, [project.path, loadCards]);

  // Ouvrir une carte pousse une entrée d'historique, pour que le retour natif (bouton
  // souris arrière, Alt+Gauche) ferme la page carte comme le bouton "Retour".
  const openCardPage = (filename: string) => {
    window.history.pushState({ codekanbanCard: filename }, '');
    setOpenFilename(filename);
  };

  useEffect(() => {
    const onPopState = () => setOpenFilename(null);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const persistCard = (card: Card) => {
    window.api.writeCard(project.path, card).then(loadCards);
  };

  const renameCard = (card: Card, title: string) => {
    window.api.renameCard(project.path, card.filename, title).then((updated) => {
      loadCards();
      setOpenFilename(updated.filename);
    });
  };

  const findContainer = (id: string): Status | undefined => {
    if (COLUMNS.some((c) => c.id === id)) return id as Status;
    return cards.find((c) => c.filename === id)?.status;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFilename(String(event.active.id));
  };

  // Déplace la carte entre colonnes dès le survol, pour un retour visuel immédiat —
  // le tri fin (et la persistance) se fait à la fin du drag dans handleDragEnd.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(String(active.id));
    const overContainer = findContainer(String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setCards((prev) => prev.map((c) => (c.filename === active.id ? { ...c, status: overContainer } : c)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFilename(null);
    if (!over) return;

    const container = findContainer(String(active.id));
    if (!container) return;

    const containerCards = cards.filter((c) => c.status === container);
    const oldIndex = containerCards.findIndex((c) => c.filename === active.id);
    const overIsCard = cards.some((c) => c.filename === over.id);
    const newIndex = overIsCard
      ? containerCards.findIndex((c) => c.filename === over.id)
      : containerCards.length - 1;
    if (oldIndex === -1 || newIndex === -1) return;

    let ordered = arrayMove(containerCards, oldIndex, newIndex);

    if (container === 'todo') {
      const draggedCard = ordered.find((c) => c.filename === active.id)!;
      const withoutActive = ordered.filter((c) => c.filename !== draggedCard.filename);
      const { min, max } = getDependencyBounds(draggedCard, withoutActive);
      const currentIndex = ordered.findIndex((c) => c.filename === draggedCard.filename);
      const clampedIndex = Math.min(Math.max(currentIndex, min), max);
      if (clampedIndex !== currentIndex) {
        ordered = arrayMove(ordered, currentIndex, clampedIndex);
      }
    }

    window.api.reorderColumn(project.path, container, ordered.map((c) => c.filename)).then(loadCards);
  };

  const openCard = cards.find((c) => c.filename === openFilename) || null;
  const activeCard = cards.find((c) => c.filename === activeFilename) || null;

  const forbiddenFilenames = new Set<string>();
  if (activeCard && activeCard.status === 'todo') {
    const todoExcl = cards.filter((c) => c.status === 'todo' && c.filename !== activeCard.filename);
    const { min, max } = getDependencyBounds(activeCard, todoExcl);
    todoExcl.forEach((c, i) => {
      if (i < min || i >= max) forbiddenFilenames.add(c.filename);
    });
  }

  useEffect(() => {
    setTitleDraft(openCard?.title ?? '');
  }, [openCard?.filename, openCard?.title]);

  // Après création d'une carte, place le focus dans le champ titre (nav) pour écrire tout de suite.
  useEffect(() => {
    if (openCard && openCard.filename === focusTitleFor) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
      setFocusTitleFor(null);
    }
  }, [openCard, focusTitleFor]);

  const copyId = () => {
    if (!openCard) return;
    window.api.copyToClipboard(openCard.id);
    setCopied(true);
    clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  return (
    <>
      <Nav
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        right={
          openCard ? (
            <select
              className={PRIORITY_CLASS[openCard.priority]}
              style={{ border: 'none', cursor: 'pointer' }}
              value={openCard.priority}
              onChange={(e) => persistCard({ ...openCard, priority: e.target.value as Card['priority'] })}
            >
              <option value="haute">haute</option>
              <option value="moyenne">moyenne</option>
              <option value="basse">basse</option>
            </select>
          ) : allProjects.length > 0 ? (
            <ProjectSwitcher current={project} projects={allProjects} onSelect={onSwitchProject} />
          ) : undefined
        }
      >
        {openCard ? (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>
              <ArrowLeftIcon />
              Retour
            </button>
            <button
              type="button"
              onClick={copyId}
              title="Copier l'identifiant"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {copied ? <CheckIcon /> : null}
              <span className="text-muted" style={{ fontSize: 13, color: copied ? 'var(--color-accent)' : undefined }}>
                {copied ? 'Copié !' : `#${openCard.id}`}
              </span>
            </button>
            {openCard.refined && <span title="Prompt affiné"><SparklesIcon /></span>}
            <input
              ref={titleInputRef}
              className="ds-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onFocus={(e) => {
                // Un select() synchrone ici est écrasé par l'action par défaut du mouseup
                // (Chromium recollapse la sélection au point de clic après le focus) : on le
                // reporte donc à la micro-tâche suivante pour qu'il s'applique après.
                const el = e.target;
                setTimeout(() => el.select(), 0);
              }}
              onBlur={() => {
                const trimmed = titleDraft.trim();
                if (trimmed && trimmed !== openCard.title) renameCard(openCard, trimmed);
                else setTitleDraft(openCard.title);
              }}
            />
          </>
        ) : (
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToRoot(); }}>
            <ArrowLeftIcon />
            Projets
          </a>
        )}
      </Nav>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {openCard ? (
          <CardPage
            card={openCard}
            allCards={cards}
            onChange={persistCard}
            onDelete={() => {
              window.api.deleteCard(project.path, openCard.filename).then(() => {
                loadCards();
                window.history.back();
              });
            }}
          />
        ) : (
          <div style={{ padding: '16px', boxSizing: 'border-box', overflowX: 'auto', width: '100%' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="board-grid" data-tutorial="board-columns">
                {COLUMNS.map((meta) => (
                  <Column
                    key={meta.id}
                    meta={meta}
                    cards={cards.filter((c) => c.status === meta.id)}
                    dragActive={!!activeFilename}
                    forbiddenFilenames={forbiddenFilenames}
                    onOpenCard={openCardPage}
                    onToggleCheck={(card) => {
                      if (card.status === 'validated') persistCard({ ...card, status: 'done' });
                      else if (card.status === 'done') persistCard({ ...card, status: 'validated' });
                    }}
                    onMoveNext={(card) => {
                      const next = nextColumn(card.status);
                      if (next) persistCard({ ...card, status: next });
                    }}
                    onRelaunch={(card) => persistCard({ ...card, status: 'todo' })}
                    onDeleteWithConfirm={setDeleteCandidate}
                    onArchiveAll={meta.id === 'validated' ? () => setConfirmArchiveAll(true) : undefined}
                    onAddCard={(status) => {
                      window.api.createCard(project.path, status).then((card) => {
                        loadCards();
                        setFocusTitleFor(card.filename);
                        openCardPage(card.filename);
                      });
                    }}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeCard && (
                  <div className="card elev-lg" style={{ width: 220, cursor: 'grabbing' }}>
                    <span className={PRIORITY_CLASS[activeCard.priority]}>{activeCard.priority}</span>
                    <div className="card-title" style={{ marginTop: 8, fontSize: 15 }}>
                      <span className="text-muted" style={{ fontSize: 12, marginRight: 6 }}>#{activeCard.id}</span>
                      {activeCard.title}
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        )}

        {deleteCandidate && (
          <div className="dialog-backdrop">
            <div className="dialog elev-lg" style={{ maxWidth: 420, width: '92%' }}>
              <div className="dialog-title">Supprimer la carte</div>
              <div className="dialog-body">
                <p style={{ margin: 0 }}>Supprimer définitivement la carte « {deleteCandidate.title} » ?</p>
              </div>
              <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteCandidate(null)}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    window.api.deleteCard(project.path, deleteCandidate.filename).then(loadCards);
                    setDeleteCandidate(null);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmArchiveAll && (
          <div className="dialog-backdrop">
            <div className="dialog elev-lg" style={{ maxWidth: 420, width: '92%' }}>
              <div className="dialog-title">Vider la colonne « Validé »</div>
              <div className="dialog-body">
                <p style={{ margin: 0 }}>Archiver définitivement toutes les cartes de la colonne « Validé » ?</p>
              </div>
              <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmArchiveAll(false)} disabled={archiving}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={archiving}
                  onClick={() => {
                    setArchiving(true);
                    window.api
                      .archiveNow(project.path)
                      .then(() => {
                        loadCards();
                        setConfirmArchiveAll(false);
                      })
                      .catch((err: unknown) => {
                        console.error('archiveNow failed', err);
                        setConfirmArchiveAll(false);
                        setArchiveError(err instanceof Error ? err.message : String(err));
                      })
                      .finally(() => setArchiving(false));
                  }}
                >
                  {archiving ? 'Archivage…' : 'Vider'}
                </button>
              </div>
            </div>
          </div>
        )}

        {archiveError && (
          <div className="dialog-backdrop">
            <div className="dialog elev-lg" style={{ maxWidth: 420, width: '92%' }}>
              <div className="dialog-title">Échec de l'archivage</div>
              <div className="dialog-body">
                <p style={{ margin: 0 }}>
                  L'archivage de la colonne « Validé » a échoué : <code>{archiveError}</code>
                </p>
              </div>
              <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={() => setArchiveError(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
