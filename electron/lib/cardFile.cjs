const matter = require('gray-matter');

const STATUSES = ['backlog', 'todo', 'doing', 'blocked', 'done', 'validated'];
const SECTION_ORDER = ['Description', 'Checklist', 'Commentaires'];

function nowIso() {
  return new Date().toISOString();
}

/** Parses a `.taskboard/*.md` file's raw text into a card object. */
function parseCardFile(raw, filename) {
  const { data, content } = matter(raw);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : (filename || '').replace(/\.md$/, '');

  const sections = splitSections(content);

  const description = (sections.Description || '').trim();

  const checklist = (sections.Checklist || '')
    .split('\n')
    .map((line) => line.match(/^\s*-\s*\[( |x|X)\]\s*(.+)$/))
    .filter(Boolean)
    .map((m) => ({ done: m[1].toLowerCase() === 'x', text: m[2].trim() }));

  const comments = parseComments(sections.Commentaires || '');

  return {
    id: String(data.id ?? ''),
    status: STATUSES.includes(data.status) ? data.status : 'backlog',
    priority: data.priority || 'moyenne',
    estimate: data.estimate || '',
    order: typeof data.order === 'number' ? data.order : 0,
    wi: data.wi || null,
    skills: Array.isArray(data.skills) ? data.skills.filter((s) => typeof s === 'string') : [],
    created: data.created || nowIso(),
    updated: data.updated || nowIso(),
    validatedAt: data.validated_at || null,
    filename,
    title,
    description,
    checklist,
    comments,
  };
}

function splitSections(content) {
  const result = {};
  const re = /^##\s+(.+)$/gm;
  const matches = [...content.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    result[name] = content.slice(start, end).trim();
  }
  return result;
}

function parseComments(block) {
  if (!block.trim()) return [];
  const re = /^\*\*(.+?)\*\*\s*—\s*(.+)$/gm;
  const matches = [...block.matchAll(re)];
  const comments = [];
  for (let i = 0; i < matches.length; i++) {
    const author = matches[i][1].trim() === 'Vous' ? 'user' : 'ia';
    const time = matches[i][2].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : block.length;
    const text = block.slice(start, end).trim();
    comments.push({ author, time, text });
  }
  return comments;
}

/** Serializes a card object back into `.taskboard/*.md` file text. */
function serializeCard(card) {
  const frontmatter = {
    id: card.id,
    status: card.status,
    priority: card.priority,
    estimate: card.estimate || '',
    order: card.order || 0,
    wi: card.wi || null,
    skills: card.skills || [],
    created: card.created || nowIso(),
    updated: nowIso(),
    validated_at: card.validatedAt || null,
  };

  const checklistBlock = (card.checklist || [])
    .map((item) => `- [${item.done ? 'x' : ' '}] ${item.text}`)
    .join('\n');

  const commentsBlock = (card.comments || [])
    .map((c) => `**${c.author === 'user' ? 'Vous' : 'Assistant IA'}** — ${c.time}\n${c.text}`)
    .join('\n\n');

  const body = [
    `# ${card.title}`,
    '',
    '## Description',
    card.description || '',
    '',
    '## Checklist',
    checklistBlock,
    '',
    '## Commentaires',
    commentsBlock,
    '',
  ].join('\n');

  return matter.stringify(body, frontmatter);
}

module.exports = { STATUSES, SECTION_ORDER, parseCardFile, serializeCard, nowIso };
