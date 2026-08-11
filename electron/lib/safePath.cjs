const path = require('node:path');
const { getStore } = require('../ipc/config.cjs');

/**
 * Throws unless `candidatePath` is exactly a known root or a direct child of one —
 * the only two shapes the renderer is ever allowed to reference as a "project path".
 * Prevents a compromised renderer from reading/writing arbitrary filesystem paths.
 */
function assertKnownProjectPath(candidatePath) {
  const resolved = path.resolve(candidatePath);
  const roots = getStore().get('roots');
  const ok = roots.some((r) => {
    const rootResolved = path.resolve(r.path);
    return resolved === rootResolved || path.dirname(resolved) === rootResolved;
  });
  if (!ok) {
    throw new Error(`Path is not a known project under a configured root: ${candidatePath}`);
  }
  return resolved;
}

module.exports = { assertKnownProjectPath };
