import { execFileSync } from 'node:child_process';

const runtimeFiles = new Set(['.astro/data-store.json', '.astro/settings.json']);

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).replace(/\s+$/, '');
}

function parseStatusLine(line) {
  const status = line.slice(0, 2);
  const file = line.slice(3);
  return { status, file };
}

function uniqueSorted(items) {
  return [...new Set(items)].sort();
}

function groupStatus(entries) {
  const runtime = [];
  const modified = [];
  const deleted = [];
  const untracked = [];
  const other = [];

  for (const entry of entries) {
    const { status, file } = entry;
    if (runtimeFiles.has(file)) {
      runtime.push(file);
      continue;
    }

    if (status === '??') {
      untracked.push(file);
    } else if (status.includes('D')) {
      deleted.push(file);
    } else if (status.includes('M')) {
      modified.push(file);
    } else {
      other.push(`${status} ${file}`);
    }
  }

  return {
    modified: uniqueSorted(modified),
    deleted: uniqueSorted(deleted),
    untracked: uniqueSorted(untracked),
    runtime: uniqueSorted(runtime),
    other: uniqueSorted(other),
  };
}

function countByPrefix(files, prefix) {
  return files.filter((file) => file.startsWith(prefix)).length;
}

const statusText = git(['status', '--short']);
const entries = statusText ? statusText.split('\n').map(parseStatusLine) : [];
const groups = groupStatus(entries);
const remotes = git(['remote', '-v']).split('\n').filter(Boolean);
const branches = git(['branch', '-vv']).split('\n').filter(Boolean);
const currentBranch = branches.find((line) => line.startsWith('* '))?.replace(/^\* /, '') ?? '';

const candidateFiles = uniqueSorted([
  ...groups.modified,
  ...groups.deleted,
  ...groups.untracked,
]);

const summary = {
  ok: groups.other.length === 0,
  currentBranch,
  counts: {
    candidateFiles: candidateFiles.length,
    modified: groups.modified.length,
    deleted: groups.deleted.length,
    untracked: groups.untracked.length,
    runtimeExcluded: groups.runtime.length,
    deletedBlogPosts: countByPrefix(groups.deleted, 'src/content/blog/'),
    deletedBlogImages: countByPrefix(groups.deleted, 'public/images/blog/'),
  },
  excludeFromRelease: groups.runtime,
  candidateFiles,
  deletedBlogPosts: groups.deleted.filter((file) => file.startsWith('src/content/blog/')),
  deletedBlogImages: groups.deleted.filter((file) => file.startsWith('public/images/blog/')),
  untrackedFiles: groups.untracked,
  unusualStatusEntries: groups.other,
  remotes,
  branches,
  notes: [
    'This script is read-only. It does not stage, commit, or push.',
    'Review remotes and branch bindings before any public push.',
    'Exclude Astro runtime cache files unless there is a deliberate reason to publish them.',
  ],
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  console.error('\nRelease candidate check found unsupported git status entries.');
  process.exit(1);
}
