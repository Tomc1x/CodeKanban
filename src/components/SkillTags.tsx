import { useEffect, useState } from 'react';

export function SkillBadges({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
      {skills.map((skill) => (
        <span key={skill} className="tag tag-outline">
          {skill}
        </span>
      ))}
    </div>
  );
}

interface SkillTagsEditorProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillTagsEditor({ skills, onChange }: SkillTagsEditorProps) {
  const [available, setAvailable] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    window.api.listAvailableSkills().then(setAvailable);
  }, []);

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setDraft('');
  };

  const removeSkill = (name: string) => {
    onChange(skills.filter((s) => s !== name));
  };

  const suggestions = available.filter((s) => !skills.includes(s));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {skills.map((skill) => (
          <span key={skill} className="tag tag-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Retirer ${skill}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: 13 }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          list="skill-suggestions"
          placeholder="Ajouter un skill…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill(draft);
            }
          }}
        />
        <datalist id="skill-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button type="button" className="btn btn-secondary" onClick={() => addSkill(draft)}>
          Ajouter
        </button>
      </div>
    </div>
  );
}
