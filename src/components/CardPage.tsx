import { useEffect, useRef, useState } from 'react';
import { Card } from '../types';
import { TrashIcon, ValidateIcon, RelaunchIcon, ChevronDownIcon } from './icons';
import { SkillTagsEditor } from './SkillTags';

interface CardPageProps {
  card: Card;
  allCards: Card[];
  onChange: (updated: Card) => void;
  onDelete: () => void;
}

const draftKey = (filename: string) => `codekanban:comment-draft:${filename}`;
const LONG_COMMENT_THRESHOLD = 320;

export default function CardPage({ card, allCards, onChange, onDelete }: CardPageProps) {
  const [notesDraft, setNotesDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(card.description);
  const [checklistDraft, setChecklistDraft] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDescriptionDraft(card.description);
    setNotesDraft(localStorage.getItem(draftKey(card.filename)) ?? '');
    setExpandedComments(new Set());
  }, [card.filename]);

  // Défile en bas de la liste des commentaires par défaut, pour voir la dernière réponse.
  useEffect(() => {
    const el = commentsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [card.filename, card.comments.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.history.back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const updateNotesDraft = (text: string) => {
    setNotesDraft(text);
    if (text) localStorage.setItem(draftKey(card.filename), text);
    else localStorage.removeItem(draftKey(card.filename));
  };

  const toggleItem = (index: number) => {
    const checklist = card.checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    onChange({ ...card, checklist });
  };

  const removeItem = (index: number) => {
    onChange({ ...card, checklist: card.checklist.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    const text = checklistDraft.trim();
    if (!text) return;
    onChange({ ...card, checklist: [...card.checklist, { done: false, text }] });
    setChecklistDraft('');
  };

  const addComment = () => {
    const text = notesDraft.trim();
    if (!text) return;
    const time = new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    onChange({ ...card, comments: [...card.comments, { author: 'user', time, text }] });
    localStorage.removeItem(draftKey(card.filename));
    setNotesDraft('');
  };

  return (
    <div className="card-page">
      <div className="card-page-cols">
        <div className="card-page-left">
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Description / prompt pour l'IA</label>
            <textarea
              className="input"
              rows={10}
              placeholder="Décris ce que l'IA doit faire…"
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={() => {
                if (descriptionDraft !== card.description) {
                  onChange({ ...card, description: descriptionDraft, refined: false });
                }
              }}
            />
          </div>

          {card.estimate && <div className="card-meta" style={{ marginBottom: 16 }}><span>{card.estimate}</span></div>}

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Skills requis</div>
          <div style={{ marginBottom: 16 }}>
            <SkillTagsEditor skills={card.skills} onChange={(skills) => onChange({ ...card, skills })} />
          </div>

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>
            Questions de clarification (AskUserQuestions)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className="switch-track"
              data-on={card.askUserQuestions === true}
              aria-pressed={card.askUserQuestions === true}
              onClick={() => onChange({ ...card, askUserQuestions: card.askUserQuestions === true ? false : true })}
            >
              <span className="switch-thumb" />
            </button>
            <span style={{ fontSize: 13 }}>
              {card.askUserQuestions === null
                ? 'Suit le réglage du projet'
                : card.askUserQuestions
                ? 'Autorisé sur cette carte'
                : 'Interdit sur cette carte'}
            </span>
            {card.askUserQuestions !== null && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => onChange({ ...card, askUserQuestions: null })}
              >
                Réinitialiser
              </button>
            )}
          </div>

          {card.status === 'todo' && (
            <>
              <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Dépend de…</div>
              <div className="checkbox-list" style={{ marginBottom: 16 }}>
                {allCards.filter((c) => c.filename !== card.filename && c.status === card.status).length === 0 && (
                  <span className="text-muted" style={{ fontSize: 13 }}>Aucune autre carte dans cette liste.</span>
                )}
                {allCards
                  .filter((c) => c.filename !== card.filename && c.status === card.status)
                  .map((c) => (
                    <label key={c.id}>
                      <input
                        type="checkbox"
                        checked={card.dependsOn.includes(c.id)}
                        onChange={(e) => {
                          const dependsOn = e.target.checked
                            ? [...card.dependsOn, c.id]
                            : card.dependsOn.filter((id) => id !== c.id);
                          onChange({ ...card, dependsOn });
                        }}
                      />
                      <span className="text-muted">#{c.id}</span> {c.title}
                    </label>
                  ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {card.checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleItem(i)} />
                  <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  aria-label="Supprimer cet élément"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: 15, opacity: 0.55 }}
                >
                  ×
                </button>
              </div>
            ))}
            {card.checklist.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun élément.</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Ajouter un élément…"
              value={checklistDraft}
              onChange={(e) => setChecklistDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="card-page-right" data-tutorial="card-comments">
          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Commentaires</div>
          <div ref={commentsRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: 12 }}>
            {card.comments.map((cm, i) => {
              const isLong = cm.text.length > LONG_COMMENT_THRESHOLD;
              const expanded = expandedComments.has(i);
              const displayText = isLong && !expanded ? `${cm.text.slice(0, LONG_COMMENT_THRESHOLD)}…` : cm.text;
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: cm.author === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    background: cm.author === 'user' ? 'var(--color-neutral-100)' : 'var(--color-accent-100)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={cm.author === 'user' ? 'tag tag-neutral' : 'tag tag-accent'}>
                      {cm.author === 'user' ? 'Vous' : 'Assistant IA'}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.5 }}>{cm.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{displayText}</p>
                  {isLong && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '2px 0', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() =>
                        setExpandedComments((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        })
                      }
                    >
                      <span style={{ transform: expanded ? 'rotate(180deg)' : undefined, display: 'inline-flex' }}>
                        <ChevronDownIcon />
                      </span>
                      {expanded ? 'Réduire' : 'Voir plus'}
                    </button>
                  )}
                </div>
              );
            })}
            {card.comments.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun commentaire.</span>}
          </div>

          <div className="field" style={{ marginTop: 'auto' }}>
            <label>Laisser une note pour l'IA</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Ex : la correction de TVA a cassé un autre cas, vérifie les commandes en devise USD…"
              value={notesDraft}
              onChange={(e) => updateNotesDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.shiftKey) return;
                e.preventDefault();
                if (notesDraft.trim()) addComment();
                else e.currentTarget.blur();
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              {card.status === 'done' && card.comments.length > 0 && card.comments[card.comments.length - 1].author === 'user' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    onChange({ ...card, status: 'todo' });
                    window.history.back();
                  }}
                >
                  <RelaunchIcon />Relancer
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={addComment}>
                Ajouter le commentaire
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmingDelete && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, background: 'var(--color-accent-100)', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-accent-800)' }}>Supprimer définitivement cette tâche ?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmingDelete(false)}>Annuler</button>
            <button type="button" className="btn btn-primary" onClick={onDelete}>Supprimer</button>
          </div>
        </div>
      )}

      <div className="dialog-actions" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setConfirmingDelete(true)}>
          <TrashIcon />Supprimer
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {card.status === 'done' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onChange({ ...card, status: 'validated' });
                window.history.back();
              }}
            >
              <ValidateIcon />Valider
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
