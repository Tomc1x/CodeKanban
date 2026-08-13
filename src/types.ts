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
  skills: string[];
  dependsOn: string[];
  askUserQuestions: boolean | null;
  refined: boolean;
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

export type ArchiveFrequency = 'daily' | 'weekly' | 'never';

export interface ProjectSettings {
  defaultSkill: string | null;
  askUserQuestionsDefault: boolean;
  archiveFrequency: ArchiveFrequency;
}

export interface CodeKanbanApi {
  listRoots: () => Promise<RootConfig[]>;
  addRoot: () => Promise<RootConfig[]>;
  removeRoot: (rootId: string) => Promise<RootConfig[]>;
  getProjectSettings: (projectPath: string) => Promise<ProjectSettings>;
  setProjectSettings: (projectPath: string, settings: Partial<ProjectSettings>) => Promise<ProjectSettings>;

  listProjects: (rootId: string) => Promise<ProjectSummary[]>;
  createProject: (rootId: string, name: string) => Promise<ProjectSummary>;

  readCards: (projectPath: string) => Promise<Card[]>;
  writeCard: (projectPath: string, card: Card) => Promise<boolean>;
  createCard: (projectPath: string, status: Status) => Promise<Card>;
  deleteCard: (projectPath: string, filename: string) => Promise<boolean>;
  reorderColumn: (projectPath: string, status: Status, orderedFilenames: string[]) => Promise<boolean>;
  renameCard: (projectPath: string, filename: string, title: string) => Promise<Card>;
  archiveNow: (projectPath: string) => Promise<boolean>;

  watchProject: (projectPath: string) => Promise<boolean>;
  unwatchProject: () => Promise<boolean>;
  onCardsChanged: (callback: (projectPath: string) => void) => () => void;

  copyToClipboard: (text: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;

  getSkillContent: () => Promise<string>;
  getSkillStatus: () => Promise<SkillStatus>;
  installSkill: () => Promise<SkillStatus>;

  minimizeWindow: () => Promise<void>;
  maximizeToggleWindow: () => Promise<boolean>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;
  onWindowMaximizedChanged: (callback: (isMaximized: boolean) => void) => () => void;

  listAvailableSkills: () => Promise<string[]>;

  checkForUpdates: () => Promise<void>;
  restartAndInstallUpdate: () => Promise<void>;
  onUpdaterStatus: (callback: (status: UpdaterStatus) => void) => () => void;
}

export type UpdaterState = 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error' | 'unsupported';

export interface UpdaterStatus {
  state: UpdaterState;
  version?: string;
  percent?: number;
  message?: string;
}

export interface SkillStatus {
  installed: boolean;
  upToDate: boolean;
  path: string;
}

declare global {
  interface Window {
    api: CodeKanbanApi;
  }
}
