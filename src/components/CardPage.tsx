import { useEffect, useState } from 'react';
import { Card } from '../types';
import { PRIORITY_CLASS } from '../lib/columns';
import { TrashIcon } from './icons';
import { SkillTagsEditor } from './SkillTags';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onChange: (updated: Card) => void;
  onDelete: () => void;
}

export default function CardModal({ card, onClose, onChange, onDelete }: CardModalProps) {
  const [notesDraft, setNotesDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [descriptionDraft, setDescriptionDraft] = useState(card.description);

  useEffect(() => {
    setTitleDraft(card.title);
    setDescriptionDraft(card.description);
  }, [card.filename]);

  const toggleItem = (index: number) => {
    const checklist = card.checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    onChange({ ...card, checklist });
  };

  const addComment = () => {
    const text = notesDraft.trim();
    if (!text) return;
    const time = new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    onChange({ ...card, comments: [...card.comments, { author: 'user', time, text }] });
    setNotesDraft('');
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog elev-lg" style={{ maxWidth: 560, width: '92%', maxHeight: '86vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span className="text-muted" style={{ fontSize: 13 }}>#{card.id}</span>
            <input
              className="ds-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                const trimmed = titleDraft.trim();
                if (trimmed !== card.title) onChange({ ...card, title: trimmed });
                setTitleDraft(trimmed);
              }}
            />
          </div>
          <span className={PRIORITY_CLASS[card.priority]}>{card.priority}</span>
        </div>

        <div className="dialog-body">
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Description / prompt pour l'IA</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Décris ce que l'IA doit faire…"
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={() => {
                if (descriptionDraft !== card.description) onChange({ ...card, description: descriptionDraft });
              }}
            />
          </div>

          {card.estimate && <div className="card-meta" style={{ marginBottom: 16 }}><span>{card.estimate}</span></div>}

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Skills requis</div>
          <div style={{ marginBottom: 16 }}>
            <SkillTagsEditor skills={card.skills} onChange={(skills) => onChange({ ...card, skills })} />
          </div>

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {card.checklist.map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(i)} />
                <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
              </label>
            ))}
            {card.checklist.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun élément.</span>}
          </div>

          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>Commentaires</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {card.comments.map((cm, i) => (
              <div key={i} style={{ borderLeft: '2px solid var(--color-divider)', paddingLeft: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={cm.author === 'user' ? 'tag tag-neutral' : 'tag tag-accent'}>
                    {cm.author === 'user' ? 'Vous' : 'Assistant IA'}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>{cm.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{cm.text}</p>
              </div>
            ))}
            {card.comments.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>Aucun commentaire.</span>}
          </div>

          <div className="field">
            <label>Laisser une note pour l'IA</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Ex : la correction de TVA a cassé un autre cas, vérifie les commandes en devise USD…"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>Fermer</button>
            <button type="button" className="btn btn-primary" onClick={addComment}>Ajouter le commentaire</button>
          </div>
        </div>
      </div>
    </div>
  );
}
