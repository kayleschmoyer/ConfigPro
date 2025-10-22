#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const exts = new Set(['.ts', '.tsx']);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (exts.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

// Regex: any import { ... } from '.../types' (with/without extension or /lib/)
const TYPES_RE = /(^\s*import\s*)\{([^}]+)\}\s*from\s*['"]([^'"]*\/(?:lib\/)?types(?:\.ts)?)['"];?/gm;

const files = walk(path.join(ROOT, 'src'));
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  src = src.replace(TYPES_RE, (_, imp, names, from) => {
    // keep names, but import them as types
    return `${imp}type {${names}} from '${from}';`;
  });
  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    changed++;
  }
}

console.log(`[fix-type-imports] Updated ${changed} file(s).`);
