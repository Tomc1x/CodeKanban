import { useCallback, useEffect, useState } from 'react';
import { Card, ProjectSummary, Status } from '../types';
import { COLUMNS, nextColumn } from '../lib/columns';
import Column from '../components/Column';
import CardModal from '../components/CardModal';

interface BoardScreenProps {
  project: ProjectSummary;
}

export default function BoardScreen({ project }: BoardScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [openFilename, setOpenFilename] = useState<string | null>(null);
  const [draggingFilename, setDraggingFilename] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

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

  const persistCard = (card: Card) => {
    window.api.writeCard(project.path, card).then(loadCards);
  };

  const resetDrag = () => {
    setDraggingFilename(null);
    setDragOverColumn(null);
    setDropIndex(null);
  };

  const handleDrop = (status: Status) => {
    if (!draggingFilename) return;
    const colCards = cards.filter((c) => c.status === status && c.filename !== draggingFilename);
    const index = dropIndex ?? colCards.length;
    const orderedFilenames = [
      ...colCards.slice(0, index).map((c) => c.filename),
      draggingFilename,
      ...colCards.slice(index).map((c) => c.filename),
    ];
    window.api.reorderColumn(project.path, status, orderedFilenames).then(loadCards);
    resetDrag();
  };

  const openCard = cards.find((c) => c.filename === openFilename) || null;

  return (
    <main style={{ flex: 1, padding: '16px', boxSizing: 'border-box', overflowX: 'auto' }}>
      <div className="board-grid">
        {COLUMNS.map((meta) => (
          <Column
            key={meta.id}
            meta={meta}
            cards={cards.filter((c) => c.status === meta.id)}
            draggingFilename={draggingFilename}
            dragOverColumn={dragOverColumn}
            dropIndex={dropIndex}
            onOpenCard={setOpenFilename}
            onDragStart={setDraggingFilename}
            onDragEnd={resetDrag}
            onDragEnter={setDragOverColumn}
            onDragLeave={(status) => setDragOverColumn((cur) => (cur === status ? null : cur))}
            onColumnDragOver={(status, index) => {
              setDragOverColumn(status);
              setDropIndex(index);
            }}
            onCardDragOver={(status, index) => {
              setDragOverColumn(status);
              setDropIndex(index);
            }}
            onDrop={handleDrop}
            onToggleCheck={(card) => {
              if (card.status === 'validated') persistCard({ ...card, status: 'done' });
              else if (card.status === 'done') persistCard({ ...card, status: 'validated' });
            }}
            onMoveNext={(card) => {
              const next = nextColumn(card.status);
              if (next) persistCard({ ...card, status: next });
            }}
            onDeleteWithConfirm={(card) => {
              if (window.confirm(`Supprimer la carte "${card.title}" ?`)) {
                window.api.deleteCard(project.path, card.filename).then(loadCards);
              }
            }}
            onAddCard={(status) => {
              window.api.createCard(project.path, status).then((card) => {
                loadCards();
                setOpenFilename(card.filename);
              });
            }}
          />
        ))}
      </div>

      {openCard && (
        <CardModal
          card={openCard}
          onClose={() => setOpenFilename(null)}
          onChange={persistCard}
          onDelete={() => {
            window.api.deleteCard(project.path, openCard.filename).then(() => {
              setOpenFilename(null);
              loadCards();
            });
          }}
        />
      )}
    </main>
  );
}
