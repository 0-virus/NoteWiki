#!/usr/bin/env node
// Mirror Claude Code's per-project memory folder against this repo's .claude-memory/.
//
//   push  machine memory  -> repo/.claude-memory/    (run before commit / on Stop)
//   pull  repo/.claude-memory/ -> machine memory     (run after clone / pull / merge)
//
// The machine memory path is derived from cwd the same way Claude Code derives it:
//   slug = cwd with ':', '\\', '/' replaced by '-'
//   memDir = ~/.claude/projects/<slug>/memory

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const direction = process.argv[2];
if (direction !== "push" && direction !== "pull") {
  console.error("usage: sync-memory.mjs <push|pull>");
  process.exit(2);
}

const repoDir = process.cwd();
const slug = repoDir.replace(/[:\\/]/g, "-");
const machineDir = join(homedir(), ".claude", "projects", slug, "memory");
const repoMemDir = join(repoDir, ".claude-memory");

const src = direction === "push" ? machineDir : repoMemDir;
const dst = direction === "push" ? repoMemDir : machineDir;

if (!existsSync(src)) {
  if (direction === "push") {
    // Nothing to push yet — silent no-op so Stop hook stays quiet.
    process.exit(0);
  }
  console.error(`source missing: ${src}`);
  process.exit(1);
}

mkdirSync(dst, { recursive: true });

function walk(dir, base = "") {
  const out = new Map();
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = statSync(full);
    if (st.isDirectory()) {
      for (const [k, v] of walk(full, rel)) out.set(k, v);
    } else {
      out.set(rel, full);
    }
  }
  return out;
}

const srcFiles = walk(src);
const dstFiles = existsSync(dst) ? walk(dst) : new Map();

let copied = 0;
for (const [rel, fullSrc] of srcFiles) {
  const fullDst = join(dst, rel);
  const dstDir = fullDst.substring(0, fullDst.length - rel.split("/").pop().length);
  mkdirSync(dstDir, { recursive: true });
  copyFileSync(fullSrc, fullDst);
  copied++;
}

let removed = 0;
for (const [rel, fullDst] of dstFiles) {
  if (!srcFiles.has(rel)) {
    rmSync(fullDst, { force: true });
    removed++;
  }
}

console.log(`memory ${direction}: ${copied} copied, ${removed} removed`);
console.log(`  src ${src}`);
console.log(`  dst ${dst}`);
