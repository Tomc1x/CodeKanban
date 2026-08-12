import { Card, Status } from '../types';
import { PRIORITY_CLASS } from '../lib/columns';
import { CheckCircleIcon, CircleIcon, ClockIcon, ChecklistIcon, CommentIcon, ArrowRightIcon } from './icons';
import { SkillBadges } from './SkillTags';

interface CardItemProps {
  card: Card;
  dragging: boolean;
  showInsertBefore: boolean;
  showProgress: boolean;
  hasNextColumn: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onCardDragOver: (before: boolean) => void;
  onToggleCheck: () => void;
  onMoveNext: () => void;
  onDeleteWithConfirm: () => void;
}

export default function CardItem({
  card,
  dragging,
  showInsertBefore,
  showProgress,
  hasNextColumn,
  onOpen,
  onDragStart,
  onDragEnd,
  onCardDragOver,
  onToggleCheck,
  onMoveNext,
  onDeleteWithConfirm,
}: CardItemProps) {
  const doneCount = card.checklist.filter((i) => i.done).length;
  const total = card.checklist.length;
  const isChecked = card.status === 'validated' || card.status === 'done';

  return (
    <>
      {showInsertBefore && <div className="drop-indicator" />}
      <div
        className="card elev-sm"
        draggable
        style={
          dragging
            ? { transform: 'rotate(-3deg) scale(1.03)', opacity: 0.6, boxShadow: 'var(--shadow-lg)', cursor: 'grabbing' }
            : { cursor: 'grab' }
        }
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onCardDragOver(e.clientY - rect.top < rect.height / 2);
        }}
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
        <div className="card-title" style={{ marginTop: 8, fontSize: 15 }}>
          <span className="text-muted" style={{ fontSize: 12, marginRight: 6 }}>#{card.id}</span>
          {card.title}
        </div>
        {card.estimate && (
          <div className="card-meta" style={{ marginTop: 8 }}>
            <ClockIcon />
            <span>{card.estimate}</span>
          </div>
        )}
        <SkillBadges skills={card.skills} />
        {showProgress && total > 0 && (
          <div style={{ height: 5, background: 'var(--color-neutral-200)', marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((doneCount / total) * 100)}%`, background: 'var(--color-accent)' }} />
          </div>
        )}
        <div className="card-meta" style={{ marginTop: 4, gap: 12 }}>
          <span><ChecklistIcon />{doneCount}/{total}</span>
          <span><CommentIcon />{card.comments.length}</span>
        </div>
      </div>
    </>
  );
}

export function statusAllowsProgress(status: Status): boolean {
  return status === 'doing' || status === 'blocked';
}
