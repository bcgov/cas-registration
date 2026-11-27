#!/usr/bin/env node
/* global console */
/**
 * Builds the docs index used by the dev-only dashboard chat
 * (apps/dashboard/app/api/chat).
 *
 * Reads every markdown file under the repo's docs/ folder, splits each file at
 * its headings into chunks of roughly MAX_CHUNK_CHARS, adds the API route and
 * page route chunks from build-codebase-map.mjs, and writes them to
 * apps/dashboard/app/api/chat/docsIndex.json.
 *
 * Also writes the codebase map that goes in every chat prompt to
 * apps/dashboard/app/api/chat/codebaseMap.json (one markdown line per entry).
 *
 * Run from bciers/: yarn chat:index
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCodebaseMap } from "./build-codebase-map.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const bciersRoot = path.resolve(here, "..");
const repoRoot = path.resolve(bciersRoot, "..");
const docsRoot = path.join(repoRoot, "docs");
const chatDir = path.join(bciersRoot, "apps/dashboard/app/api/chat");
const outFile = path.join(chatDir, "docsIndex.json");
const mapFile = path.join(chatDir, "codebaseMap.json");

const MAX_CHUNK_CHARS = 1500;
const MIN_CHUNK_CHARS = 40;

async function listMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdown(full);
      return entry.name.endsWith(".md") ? [full] : [];
    }),
  );
  return files.flat().sort();
}

// Removes HTML comments until none are left, since removing one can join the
// text around it into a new one (for example "<!<!-- -->-- x -->").
function stripComments(text) {
  let previous;
  do {
    previous = text;
    text = text.replace(/<!--[\s\S]*?-->/g, "");
  } while (text !== previous);
  return text;
}

// Drops images and HTML comments, which add tokens but no answerable content.
function clean(text) {
  return stripComments(text)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Splits text longer than MAX_CHUNK_CHARS at paragraph breaks.
function splitLong(text) {
  if (text.length <= MAX_CHUNK_CHARS) return [text];
  const parts = [];
  let current = "";
  for (const para of text.split(/\n\n+/)) {
    if (current && current.length + para.length + 2 > MAX_CHUNK_CHARS) {
      parts.push(current);
      current = "";
    }
    current = current ? `${current}\n\n${para}` : para;
  }
  if (current) parts.push(current);
  return parts;
}

function chunkFile(relPath, markdown) {
  const sections = [];
  const headingTrail = [];
  let heading = "";
  let lines = [];
  let inFence = false;

  const flush = () => {
    const text = clean(lines.join("\n"));
    if (text.length >= MIN_CHUNK_CHARS) sections.push({ heading, text });
    lines = [];
  };

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const match = !inFence && /^(#{1,4})\s+(.*)$/.exec(line);
    if (match) {
      flush();
      const level = match[1].length;
      headingTrail.length = level - 1;
      headingTrail[level - 1] = match[2].trim();
      heading = headingTrail.filter(Boolean).join(" > ");
      continue;
    }
    lines.push(line);
  }
  flush();

  return sections.flatMap(({ heading: h, text }) =>
    splitLong(text).map((part) => ({ path: relPath, heading: h, text: part })),
  );
}

const files = await listMarkdown(docsRoot);
const chunks = [];
for (const file of files) {
  const relPath = path.relative(repoRoot, file);
  const markdown = await readFile(file, "utf8");
  for (const chunk of chunkFile(relPath, markdown)) {
    chunks.push({ id: chunks.length, ...chunk });
  }
}

const codebase = buildCodebaseMap(repoRoot);
for (const chunk of codebase.chunks) {
  chunks.push({ id: chunks.length, ...chunk });
}

await writeFile(outFile, `${JSON.stringify(chunks, null, 2)}\n`);
await writeFile(mapFile, `${JSON.stringify(codebase.map, null, 2)}\n`);
console.log(
  `Wrote ${chunks.length} chunks (${codebase.chunks.length} from code) from ${files.length} docs to ${path.relative(bciersRoot, outFile)}`,
);
console.log(
  `Wrote the codebase map (${codebase.map.join("\n").length} characters) to ${path.relative(bciersRoot, mapFile)}`,
);
