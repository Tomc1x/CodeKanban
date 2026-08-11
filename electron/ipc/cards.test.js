import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readCardsFromDisk, taskboardDir } from './cards.cjs';
import { serializeCard } from '../lib/cardFile.cjs';

let projectDir;

beforeEach(() => {
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codekanban-test-'));
});

afterEach(() => {
  fs.rmSync(projectDir, { recursive: true, force: true });
});

function writeFixtureCard(overrides) {
  const card = {
    id: '001',
    status: 'todo',
    priority: 'moyenne',
    estimate: '',
    order: 0,
    wi: null,
    created: '2026-08-11T10:00:00.000Z',
    updated: '2026-08-11T10:00:00.000Z',
    validatedAt: null,
    filename: '001-fixture.md',
    title: 'Fixture',
    description: '',
    checklist: [],
    comments: [],
    ...overrides,
  };
  const dir = taskboardDir(projectDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, card.filename), serializeCard(card), 'utf-8');
}

describe('readCardsFromDisk', () => {
  it('returns an empty array when .taskboard does not exist', () => {
    expect(readCardsFromDisk(projectDir)).toEqual([]);
  });

  it('reads only .md files and sorts by order', () => {
    writeFixtureCard({ filename: '002-second.md', title: 'Second', order: 20 });
    writeFixtureCard({ filename: '001-first.md', title: 'First', order: 10 });
    fs.writeFileSync(path.join(taskboardDir(projectDir), 'readme.txt'), 'not a card');

    const cards = readCardsFromDisk(projectDir);
    expect(cards.map((c) => c.title)).toEqual(['First', 'Second']);
  });
});
