export type Status = 'backlog' | 'todo' | 'doing' | 'blocked' | 'done' | 'validated';
export type Priority = 'haute' | 'moyenne' | 'basse';
export type Author = 'user' | 'ia';

export interface ChecklistItem {
  done: boolean;
  text: string;
}

export interface CardComment {
  author: Author;
  time: string;
  text: string;
}

export interface Card {
  id: string;
  status: Status;
  priority: Priority;
  estimate: string;
  order: number;
  wi: string | null;
  created: string;
  updated: string;
  validatedAt: string | null;
  filename: string;
  title: string;
  description: string;
  checklist: ChecklistItem[];
  comments: CardComment[];
}

export interface RootConfig {
  id: string;
  path: string;
  name: string;
}

export interface ProjectSummary {
  path: string;
  name: string;
  totalCount: number;
  activeCount: number;
  blockedCount: number;
}

export interface CodeKanbanApi {
  listRoots: () => Promise<RootConfig[]>;
  addRoot: () => Promise<RootConfig[]>;
  removeRoot: (rootId: string) => Promise<RootConfig[]>;

  listProjects: (rootId: string) => Promise<ProjectSummary[]>;

  readCards: (projectPath: string) => Promise<Card[]>;
  writeCard: (projectPath: string, card: Card) => Promise<boolean>;
  createCard: (projectPath: string, status: Status) => Promise<Card>;
  deleteCard: (projectPath: string, filename: string) => Promise<boolean>;
  reorderColumn: (projectPath: string, status: Status, orderedFilenames: string[]) => Promise<boolean>;

  watchProject: (projectPath: string) => Promise<boolean>;
  unwatchProject: () => Promise<boolean>;
  onCardsChanged: (callback: (projectPath: string) => void) => () => void;

  copyToClipboard: (text: string) => Promise<void>;
}

declare global {
  interface Window {
    api: CodeKanbanApi;
  }
}
