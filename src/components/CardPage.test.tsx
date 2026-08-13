import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardPage from './CardPage';
import { Card } from '../types';

beforeEach(() => {
  (window as any).api = { listAvailableSkills: vi.fn().mockResolvedValue([]) };
});

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: '001',
    status: 'todo',
    priority: 'moyenne',
    estimate: '',
    order: 10,
    wi: null,
    skills: [],
    dependsOn: [],
    askUserQuestions: null,
    refined: false,
    created: '2026-08-11T10:00:00.000Z',
    updated: '2026-08-11T10:00:00.000Z',
    validatedAt: null,
    filename: '001-test.md',
    title: 'Nouvelle tâche',
    description: '',
    checklist: [],
    comments: [],
    ...overrides,
  };
}

describe('CardPage description editing', () => {
  it('does not persist the description until blur, preserving internal spaces', () => {
    const onChange = vi.fn();
    const card = makeCard();
    render(<CardPage card={card} onDelete={() => {}} onChange={onChange} allCards={[card]} />);

    const description = screen.getByPlaceholderText("Décris ce que l'IA doit faire…") as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: 'Ecrire des tests et des pipelines pour github.' } });

    expect(description.value).toBe('Ecrire des tests et des pipelines pour github.');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(description);
    expect(onChange).toHaveBeenCalledWith({ ...card, description: 'Ecrire des tests et des pipelines pour github.' });
  });
});

describe('CardPage skill tags', () => {
  it('adds a skill tag and persists it via onChange', async () => {
    const onChange = vi.fn();
    const card = makeCard();
    render(<CardPage card={card} onDelete={() => {}} onChange={onChange} allCards={[card]} />);

    const input = screen.getByPlaceholderText('Ajouter un skill…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'codekanban' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith({ ...card, skills: ['codekanban'] });
  });

  it('removes an existing skill tag via onChange', () => {
    const onChange = vi.fn();
    const card = makeCard({ skills: ['codekanban', 'ipeos-manager'] });
    render(<CardPage card={card} onDelete={() => {}} onChange={onChange} allCards={[card]} />);

    fireEvent.click(screen.getByLabelText('Retirer codekanban'));

    expect(onChange).toHaveBeenCalledWith({ ...card, skills: ['ipeos-manager'] });
  });
});
