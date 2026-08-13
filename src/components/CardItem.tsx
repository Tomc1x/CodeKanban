import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Status } from '../types';
import { PRIORITY_CLASS } from '../lib/columns';
import { CheckCircleIcon, CircleIcon, ClockIcon, ChecklistIcon, CommentIcon, ArrowRightIcon, SparklesIcon, ValidateIcon, RelaunchIcon } from './icons';

interface CardItemProps {
  card: Card;
  showProgress: boolean;
  hasNextColumn: boolean;
  isDoneColumn: boolean;
  canRelaunch: boolean;
  forbiddenDrop: boolean;
  onOpen: () => void;
  onToggleCheck: () => void;
  onMoveNext: () => void;
  onRelaunch: () => void;
  onDeleteWithConfirm: () => void;
}

export default function CardItem({
  card,
  showProgress,
  hasNextColumn,
  isDoneColumn,
  canRelaunch,
  forbiddenDrop,
  onOpen,
  onToggleCheck,
  onMoveNext,
  onRelaunch,
  onDeleteWithConfirm,
}: CardItemProps) {
  const doneCount = card.checklist.filter((i) => i.done).length;
  const total = card.checklist.length;
  const isChecked = card.status === 'validated' || card.status === 'done';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.filename });

  return (
    <div
      ref={setNodeRef}
      className={`card elev-sm${forbiddenDrop ? ' drop-zone-forbidden' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onDeleteWithConfirm();
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ width: 22, height: 22, padding: 0 }}
            title="Marquer comme terminé"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheck();
            }}
          >
            {isChecked ? <CheckCircleIcon /> : <CircleIcon />}
          </button>
          <span className={PRIORITY_CLASS[card.priority]}>{card.priority}</span>
        </div>
        {hasNextColumn && (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ width: 24, height: 24 }}
            title="Déplacer vers la colonne suivante"
            onClick={(e) => {
              e.stopPropagation();
              onMoveNext();
            }}
          >
            <ArrowRightIcon />
          </button>
        )}
      </div>
      <div className="card-title" style={{ marginTop: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="text-muted" style={{ fontSize: 12 }}>#{card.id}</span>
        {card.refined && <span title="Prompt affiné"><SparklesIcon /></span>}
        {card.title}
      </div>
      {card.estimate && (
        <div className="card-meta" style={{ marginTop: 8 }}>
          <ClockIcon />
          <span>{card.estimate}</span>
        </div>
      )}
      {showProgress && total > 0 && (
        <div style={{ height: 5, background: 'var(--color-neutral-200)', marginTop: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round((doneCount / total) * 100)}%`, background: 'var(--color-accent)' }} />
        </div>
      )}
      <div className="card-meta" style={{ marginTop: 4, gap: 12 }}>
        <span><ChecklistIcon />{doneCount}/{total}</span>
        <span><CommentIcon />{card.comments.length}</span>
      </div>
      {isDoneColumn && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheck();
            }}
          >
            <ValidateIcon />
            Valider
          </button>
          {canRelaunch && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: 12, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={(e) => {
                e.stopPropagation();
                onRelaunch();
              }}
            >
              <RelaunchIcon />
              Relancer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function statusAllowsProgress(status: Status): boolean {
  return status === 'doing' || status === 'blocked';
}
