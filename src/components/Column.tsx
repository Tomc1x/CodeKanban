import { Card, Status } from '../types';
import { ColumnMeta, nextColumn } from '../lib/columns';
import CardItem from './CardItem';
import { PlusIcon } from './icons';

interface ColumnProps {
  meta: ColumnMeta;
  cards: Card[];
  draggingFilename: string | null;
  dragOverColumn: Status | null;
  dropIndex: number | null;
  onOpenCard: (filename: string) => void;
  onDragStart: (filename: string) => void;
  onDragEnd: () => void;
  onDragEnter: (status: Status) => void;
  onDragLeave: (status: Status) => void;
  onColumnDragOver: (status: Status, index: number) => void;
  onCardDragOver: (status: Status, index: number) => void;
  onDrop: (status: Status) => void;
  onToggleCheck: (card: Card) => void;
  onMoveNext: (card: Card) => void;
  onDeleteWithConfirm: (card: Card) => void;
  onAddCard: (status: Status) => void;
}

export default function Column({
  meta,
  cards,
  draggingFilename,
  dragOverColumn,
  dropIndex,
  onOpenCard,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onColumnDragOver,
  onCardDragOver,
  onDrop,
  onToggleCheck,
  onMoveNext,
  onDeleteWithConfirm,
  onAddCard,
}: ColumnProps) {
  const draggingActive = !!draggingFilename;
  const isDragOverThis = dragOverColumn === meta.id;
  const next = nextColumn(meta.id);

  return (
    <div
      className="board-column"
      onDragOver={(e) => {
        e.preventDefault();
        onColumnDragOver(meta.id, cards.length);
      }}
      onDragEnter={() => onDragEnter(meta.id)}
      onDragLeave={() => onDragLeave(meta.id)}
      onDrop={() => onDrop(meta.id)}
    >
      <div className={`board-column-header${meta.id === 'blocked' ? ' is-blocked' : ''}`}>
        <span className="board-column-label">{meta.label}</span>
        <span className="board-column-count">{cards.length}</span>
      </div>
      <div className="board-cards">
        {cards.map((card, i) => (
          <CardItem
            key={card.filename}
            card={card}
            dragging={draggingFilename === card.filename}
            showInsertBefore={draggingActive && isDragOverThis && dropIndex === i}
            showProgress={meta.id === 'doing' || meta.id === 'blocked'}
            hasNextColumn={!!next}
            onOpen={() => onOpenCard(card.filename)}
            onDragStart={() => onDragStart(card.filename)}
            onDragEnd={onDragEnd}
            onCardDragOver={(before) => onCardDragOver(meta.id, i + (before ? 0 : 1))}
            onToggleCheck={() => onToggleCheck(card)}
            onMoveNext={() => onMoveNext(card)}
            onDeleteWithConfirm={() => onDeleteWithConfirm(card)}
          />
        ))}
        {draggingActive && isDragOverThis && cards.length === 0 && (
          <div className="drop-empty">Déposer ici</div>
        )}
        {draggingActive && isDragOverThis && dropIndex === cards.length && cards.length > 0 && (
          <div className="drop-indicator" />
        )}
        {meta.showAddGhost && (
          <button type="button" className="add-ghost" onClick={() => onAddCard(meta.id)}>
            <PlusIcon />
            Ajouter une carte
          </button>
        )}
      </div>
    </div>
  );
}
