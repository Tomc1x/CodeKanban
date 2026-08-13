import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, Status } from '../types';
import { ColumnMeta, nextColumn } from '../lib/columns';
import CardItem from './CardItem';
import { PlusIcon, TrashIcon } from './icons';

interface ColumnProps {
  meta: ColumnMeta;
  cards: Card[];
  dragActive: boolean;
  forbiddenFilenames: Set<string>;
  onOpenCard: (filename: string) => void;
  onToggleCheck: (card: Card) => void;
  onMoveNext: (card: Card) => void;
  onRelaunch: (card: Card) => void;
  onDeleteWithConfirm: (card: Card) => void;
  onAddCard: (status: Status) => void;
  onArchiveAll?: () => void;
}

export default function Column({
  meta,
  cards,
  dragActive,
  forbiddenFilenames,
  onOpenCard,
  onToggleCheck,
  onMoveNext,
  onRelaunch,
  onDeleteWithConfirm,
  onAddCard,
  onArchiveAll,
}: ColumnProps) {
  const next = nextColumn(meta.id);
  const { setNodeRef } = useDroppable({ id: meta.id });

  return (
    <div className="board-column">
      <div className={`board-column-header${meta.id === 'blocked' ? ' is-blocked' : ''}`}>
        <span className="board-column-label">{meta.label}</span>
        <span className="board-column-count">{cards.length}</span>
        {meta.id === 'validated' && cards.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto', width: 63, height: 30, padding: 0 }}
            title="Vider (archiver toutes les cartes validées)"
            onClick={onArchiveAll}
          >
            <TrashIcon />
            Vider
          </button>
        )}
      </div>
      <div className="board-cards" ref={setNodeRef}>
        <SortableContext items={cards.map((c) => c.filename)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem
              key={card.filename}
              card={card}
              showProgress={meta.id === 'doing' || meta.id === 'blocked'}
              hasNextColumn={!!next}
              isDoneColumn={meta.id === 'done'}
              canRelaunch={meta.id === 'done' && card.comments.length > 0 && card.comments[card.comments.length - 1].author === 'user'}
              forbiddenDrop={forbiddenFilenames.has(card.filename)}
              onOpen={() => onOpenCard(card.filename)}
              onToggleCheck={() => onToggleCheck(card)}
              onMoveNext={() => onMoveNext(card)}
              onRelaunch={() => onRelaunch(card)}
              onDeleteWithConfirm={() => onDeleteWithConfirm(card)}
            />
          ))}
        </SortableContext>
        {dragActive && cards.length === 0 && <div className="drop-empty">Déposer ici</div>}
      </div>
      {meta.showAddGhost && (
        <button
          type="button"
          className="add-ghost"
          data-tutorial={meta.id === 'todo' ? 'add-card' : undefined}
          onClick={() => onAddCard(meta.id)}
        >
          <PlusIcon />
          Ajouter une carte
        </button>
      )}
    </div>
  );
}
