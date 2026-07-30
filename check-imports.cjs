const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const ignoredDirs = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'out', '.turbo']);
const sourceExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.css', '.scss', '.sass', '.less', '.mdx']);

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files = files.concat(walk(full));
      }
    } else if (sourceExts.has(path.extname(entry.name)) || entry.name === 'package.json') {
      files.push(full);
    }
  }
  return files;
}

function findCaseInsensitiveMatch(targetPath) {
  if (!targetPath) return null;

  const rootPath = path.parse(targetPath).root;
  const rel = path.relative(rootPath, targetPath);
  const parts = rel.split(path.sep).filter(Boolean);

  let current = rootPath;
  for (const part of parts) {
    if (!fs.existsSync(current)) return null;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return null;
    }

    const match = entries.find((e) => e.name.toLowerCase() === part.toLowerCase());
    if (!match) return null;

    current = path.join(current, match.name);
  }

  return current;
}

function resolveSpecifier(fromFile, specifier) {
  const clean = specifier.split(/[?#]/)[0];

  if (!clean) return { exists: false };

  if (clean.startsWith('.')) {
    const base = path.resolve(path.dirname(fromFile), clean);
    const candidates = [base];

    if (!path.extname(base)) {
      const exts = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.css', '.scss', '.sass', '.less', '.d.ts'];
      for (const ext of exts) candidates.push(base + ext);

      const indexFiles = ['index.js', 'index.jsx', 'index.ts', 'index.tsx', 'index.mjs', 'index.cjs', 'index.json', 'index.css', 'index.scss', 'index.sass', 'index.less'];
      for (const name of indexFiles) candidates.push(path.join(base, name));
    }

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return { exists: true, resolved: cand, caseMismatch: false };
      }

      const caseMatch = findCaseInsensitiveMatch(cand);
      if (caseMatch && caseMatch !== cand) {
        return { exists: true, resolved: caseMatch, caseMismatch: true };
      }
    }

    return { exists: false };
  }

  if (clean.startsWith('/')) {
    const abs = path.resolve(root, clean.slice(1));
    if (fs.existsSync(abs)) return { exists: true, resolved: abs, caseMismatch: false };

    const caseMatch = findCaseInsensitiveMatch(abs);
    if (caseMatch && caseMatch !== abs) {
      return { exists: true, resolved: caseMatch, caseMismatch: true };
    }
  }

  return { exists: false };
}

const files = walk(root);
const importPattern = /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.matchAll(importPattern);

  for (const match of matches) {
    const specifier = match[1] || match[2] || match[3];
    if (!specifier) continue;

    if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;

    const result = resolveSpecifier(file, specifier);
    if (!result.exists) {
      issues.push({
        file,
        specifier,
        reason: 'not found'
      });
    } else if (result.caseMismatch) {
      issues.push({
        file,
        specifier,
        reason: `case mismatch (expected ${path.relative(path.dirname(file), result.resolved)})`
      });
    }
  }
}

console.log(`Scanned ${files.length} files under ${root}`);
if (issues.length) {
  console.log(`Found ${issues.length} possible broken import(s):`);
  for (const issue of issues) {
    const relFile = path.relative(root, issue.file);
    console.log(`- ${relFile} -> ${issue.specifier}`);
    console.log(`  ${issue.reason}`);
  }
} else {
  console.log('No obvious broken relative imports found.');
}