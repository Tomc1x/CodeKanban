import { describe, it, expect } from 'vitest';
import { parseCardFile, serializeCard, STATUSES } from './cardFile.cjs';

function baseCard(overrides = {}) {
  return {
    id: '001',
    status: 'todo',
    priority: 'moyenne',
    estimate: '~30 min',
    order: 10,
    wi: null,
    created: '2026-08-11T10:00:00.000Z',
    updated: '2026-08-11T10:00:00.000Z',
    validatedAt: null,
    filename: '001-test.md',
    title: 'Corriger le bug de pagination',
    description: 'Texte libre pour l\'IA.',
    checklist: [
      { done: true, text: 'Reproduire le bug' },
      { done: false, text: 'Corriger le calcul' },
    ],
    comments: [
      { author: 'user', time: '2026-08-11 14:32', text: 'Merci de corriger.' },
      { author: 'ia', time: '2026-08-11 15:00', text: 'Corrigé.' },
    ],
    ...overrides,
  };
}

describe('serializeCard + parseCardFile round trip', () => {
  it('preserves title, description, checklist and comments', () => {
    const card = baseCard();
    const raw = serializeCard(card);
    const parsed = parseCardFile(raw, card.filename);

    expect(parsed.title).toBe(card.title);
    expect(parsed.description).toBe(card.description);
    expect(parsed.checklist).toEqual(card.checklist);
    expect(parsed.comments).toEqual([
      { author: 'user', time: '2026-08-11 14:32', text: 'Merci de corriger.' },
      { author: 'ia', time: '2026-08-11 15:00', text: 'Corrigé.' },
    ]);
  });

  it('preserves internal spaces in the title (regression: spaces used to be swallowed)', () => {
    const card = baseCard({ title: 'Test et pipelines pour github' });
    const parsed = parseCardFile(serializeCard(card), card.filename);
    expect(parsed.title).toBe('Test et pipelines pour github');
  });

  it('preserves internal spaces in the description', () => {
    const card = baseCard({ description: 'Ecrire des tests et des pipelines pour github.' });
    const parsed = parseCardFile(serializeCard(card), card.filename);
    expect(parsed.description).toBe('Ecrire des tests et des pipelines pour github.');
  });

  it('falls back to "backlog" for an unknown or missing status', () => {
    const raw = serializeCard(baseCard({ status: 'not-a-real-status' }));
    const parsed = parseCardFile(raw, '001-test.md');
    expect(parsed.status).toBe('backlog');
    expect(STATUSES).toContain('backlog');
  });

  it('falls back to the filename when the title heading is missing', () => {
    const raw = '---\nid: "002"\nstatus: todo\n---\n\n## Description\nSans titre.\n';
    const parsed = parseCardFile(raw, '002-sans-titre.md');
    expect(parsed.title).toBe('002-sans-titre');
  });

  it('round-trips an empty checklist and empty comments', () => {
    const card = baseCard({ checklist: [], comments: [] });
    const parsed = parseCardFile(serializeCard(card), card.filename);
    expect(parsed.checklist).toEqual([]);
    expect(parsed.comments).toEqual([]);
  });
});
