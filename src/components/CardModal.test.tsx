import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardModal from './CardModal';
import { Card } from '../types';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: '001',
    status: 'todo',
    priority: 'moyenne',
    estimate: '',
    order: 10,
    wi: null,
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

describe('CardModal title/description editing', () => {
  it('keeps spaces while typing and does not persist on every keystroke (regression)', () => {
    const onChange = vi.fn();
    const card = makeCard();
    render(<CardModal card={card} onClose={() => {}} onChange={onChange} onDelete={() => {}} />);

    const titleInput = screen.getByDisplayValue('Nouvelle tâche') as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.change(titleInput, { target: { value: 'Test ' } });
    fireEvent.change(titleInput, { target: { value: 'Test e' } });
    fireEvent.change(titleInput, { target: { value: 'Test et' } });
    fireEvent.change(titleInput, { target: { value: 'Test et ' } });
    fireEvent.change(titleInput, { target: { value: 'Test et pipelines' } });

    expect(titleInput.value).toBe('Test et pipelines');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(titleInput);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ ...card, title: 'Test et pipelines' });
  });

  it('trims leading/trailing whitespace from the title on blur', () => {
    const onChange = vi.fn();
    const card = makeCard();
    render(<CardModal card={card} onClose={() => {}} onChange={onChange} onDelete={() => {}} />);

    const titleInput = screen.getByDisplayValue('Nouvelle tâche') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: '  Titre avec espaces  ' } });
    fireEvent.blur(titleInput);

    expect(onChange).toHaveBeenCalledWith({ ...card, title: 'Titre avec espaces' });
  });

  it('does not persist the description until blur, preserving internal spaces', () => {
    const onChange = vi.fn();
    const card = makeCard();
    render(<CardModal card={card} onClose={() => {}} onDelete={() => {}} onChange={onChange} />);

    const description = screen.getByPlaceholderText("Décris ce que l'IA doit faire…") as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: 'Ecrire des tests et des pipelines pour github.' } });

    expect(description.value).toBe('Ecrire des tests et des pipelines pour github.');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(description);
    expect(onChange).toHaveBeenCalledWith({ ...card, description: 'Ecrire des tests et des pipelines pour github.' });
  });
});
