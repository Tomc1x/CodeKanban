import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BoardScreen from './BoardScreen';
import { Card, ProjectSummary } from '../types';
import { ToastProvider } from '../lib/toast';

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

const project: ProjectSummary = { path: '/tmp/proj', name: 'Proj', totalCount: 1, activeCount: 1, blockedCount: 0 };

beforeEach(() => {
  const card = makeCard();
  (window as any).api = {
    readCards: vi.fn().mockResolvedValue([card]),
    watchProject: vi.fn().mockResolvedValue(true),
    unwatchProject: vi.fn().mockResolvedValue(true),
    onCardsChanged: vi.fn().mockReturnValue(() => {}),
    renameCard: vi.fn().mockResolvedValue({ ...card, title: 'Test et pipelines', filename: '001-test-et-pipelines.md' }),
    listAvailableSkills: vi.fn().mockResolvedValue([]),
  };
});

describe('BoardScreen card title rename (in nav)', () => {
  it('renames the card via the nav title input on blur, not on every keystroke', async () => {
    render(
      <ToastProvider>
        <BoardScreen
          project={project}
          allProjects={[project]}
          isDark={false}
          onToggleTheme={() => {}}
          onBackToRoot={() => {}}
          onSwitchProject={() => {}}
        />
      </ToastProvider>
    );

    fireEvent.click(await screen.findByText('Nouvelle tâche'));

    const titleInput = await screen.findByDisplayValue('Nouvelle tâche') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test et pipelines' } });
    expect((window as any).api.renameCard).not.toHaveBeenCalled();

    fireEvent.blur(titleInput);

    await waitFor(() => expect((window as any).api.renameCard).toHaveBeenCalledWith(project.path, '001-test.md', 'Test et pipelines'));
  });
});
