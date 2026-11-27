/**
 * Builds what the dev-only dashboard chat knows about the code:
 * - `map`: markdown lines sent with every question (overview, page routes per
 *   zone as a tree with roles, Django models with their relations and choice
 *   values).
 * - `chunks`: searchable excerpts added to the docs index (API routes and
 *   frontend enums per source file), sent only when they match a question.
 *
 * Parses tracked files only (git ls-files), with regular expressions, and never
 * calls a model. Called by build-chat-index.mjs.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DJANGO_APPS = [
  "common",
  "registration",
  "reporting",
  "compliance",
  "task_scheduler",
];
const ZONES = [
  { app: "dashboard", basePath: "", appDir: "app", port: 3000 },
  { app: "registration", basePath: "/registration", appDir: "app", port: 4000 },
  {
    app: "administration",
    basePath: "/administration",
    appDir: "app",
    port: 4001,
  },
  { app: "reporting", basePath: "/reporting", appDir: "src/app", port: 5000 },
  { app: "compliance", basePath: "/compliance", appDir: "src/app", port: 7000 },
];
// Django model base classes worth listing; helpers such as models.Func are skipped.
const MODEL_BASE =
  /(Model|TimeStampedModel|EventBaseModel|UserAndContactCommonInfo|Task)\b/;
const MAX_COMMENT_CHARS = 160;
const MAX_CHOICE_VALUES = 20;

// Runs git from a fixed system location instead of searching PATH, so a
// writable PATH entry can't swap in another program.
const GIT_DIRS = ["/usr/bin", "/usr/local/bin", "/opt/homebrew/bin"];
let gitPath;
const git = () => {
  gitPath ??= GIT_DIRS.map((dir) => path.join(dir, "git")).find((file) =>
    existsSync(file),
  );
  if (!gitPath) {
    throw new Error(`git not found in ${GIT_DIRS.join(", ")}`);
  }
  return gitPath;
};

const gitFiles = (repoRoot, ...patterns) =>
  execFileSync(git(), ["ls-files", "--", ...patterns], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

const read = (repoRoot, file) =>
  readFileSync(path.join(repoRoot, file), "utf8");

const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

// Joins Python string literals ("a" "b" or """a""") into one line of text.
function pythonStrings(source) {
  const parts = [];
  const re =
    /"""([\s\S]*?)"""|'''([\s\S]*?)'''|"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g;
  let match;
  while ((match = re.exec(source))) {
    parts.push(match[1] ?? match[2] ?? match[3] ?? match[4] ?? "");
  }
  return parts.join("").replace(/\s+/g, " ").trim();
}

// Reads the indented body of a Python class that starts at lines[start].
function classBody(lines, start) {
  const indent = lines[start].match(/^\s*/)[0].length;
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && line.match(/^\s*/)[0].length <= indent) break;
    body.push(line);
  }
  return body;
}

function parseChoices(bodyLines) {
  return bodyLines
    .map((line) => /^\s+[A-Z][A-Z0-9_]*\s*=\s*(.+)$/.exec(line))
    .filter(Boolean)
    .map((match) => {
      // NAME = "Label" or NAME = "value", "Label": keep the first string.
      const value = /^\(?\s*["']([^"']*)["']/.exec(match[1].trim());
      return value ? value[1] : match[1].trim();
    });
}

function parseModelsFile(source) {
  const lines = source.split("\n");
  const models = [];
  const topLevelChoices = [];

  lines.forEach((line, i) => {
    const top = /^class (\w+)\(([^)]*)\):/.exec(line);
    if (!top) return;
    const [, name, bases] = top;
    const body = classBody(lines, i);
    const bodyText = body.join("\n");

    if (/Choices\b/.test(bases)) {
      topLevelChoices.push({ name, values: parseChoices(body) });
      return;
    }
    if (!MODEL_BASE.test(bases) || /\b(Func|Manager|QuerySet)\b/.test(bases))
      return;

    const comment =
      /db_table_comment\s*=\s*(\([\s\S]*?\)|"""[\s\S]*?"""|"[^"\n]*"|'[^'\n]*')/.exec(
        bodyText,
      );
    const relations = [
      ...bodyText.matchAll(
        /^\s{4}(\w+)\s*=\s*models\.(ForeignKey|OneToOneField|ManyToManyField)\(\s*["']?([\w.]+)["']?/gm,
      ),
    ].map(
      ([, field, kind, target]) =>
        `${field}→${target.split(".").pop()}${kind === "ManyToManyField" ? "[]" : ""}`,
    );
    const choices = [];
    body.forEach((bodyLine, j) => {
      const nested = /^\s+class (\w+)\([^)]*Choices[^)]*\):/.exec(bodyLine);
      if (nested)
        choices.push({
          name: nested[1],
          values: parseChoices(classBody(body, j)),
        });
    });

    models.push({
      name,
      comment: comment
        ? truncate(pythonStrings(comment[1]), MAX_COMMENT_CHARS)
        : "",
      relations,
      choices,
    });
  });
  return { models, topLevelChoices };
}

const formatChoices = ({ name, values }) => {
  const shown = values.slice(0, MAX_CHOICE_VALUES).join(" | ");
  const more =
    values.length > MAX_CHOICE_VALUES
      ? ` | …(+${values.length - MAX_CHOICE_VALUES})`
      : "";
  return `${name}: ${shown}${more}`;
};

function djangoSection(repoRoot) {
  const out = ["## Backend: Django models (bc_obps/<app>/models/)", ""];
  out.push(
    "Format: `Model` (file under bc_obps/<app>/) – table comment. rel: field→Target (FK/one-to-one, [] = many-to-many). choices: Enum: values.",
    "",
  );
  for (const app of DJANGO_APPS) {
    const files = gitFiles(repoRoot, `bc_obps/${app}/models/**.py`).filter(
      (file) => !file.endsWith("__init__.py"),
    );
    const entries = [];
    for (const file of files) {
      const { models, topLevelChoices } = parseModelsFile(read(repoRoot, file));
      const appFile = file.slice(`bc_obps/${app}/`.length);
      for (const model of models) {
        let line = `- \`${model.name}\` (${appFile})`;
        if (model.comment) line += ` – ${model.comment}`;
        if (model.relations.length)
          line += ` rel: ${model.relations.join(", ")}.`;
        if (model.choices.length)
          line += ` choices: ${model.choices.map(formatChoices).join("; ")}.`;
        entries.push(line);
      }
      for (const choice of topLevelChoices) {
        entries.push(`- choices \`${formatChoices(choice)}\` (${appFile})`);
      }
    }
    if (!entries.length) continue;
    out.push(`### ${app}`, "", ...entries.sort(), "");
  }
  return out;
}

function apiChunks(repoRoot) {
  const prefixes = {};
  for (const match of read(repoRoot, "bc_obps/bc_obps/api.py").matchAll(
    /add_router\(\s*"([^"]+)",\s*(\w+)/g,
  )) {
    prefixes[match[2]] = `/api${match[1]}`;
  }
  const chunks = [];
  for (const app of ["common", "registration", "reporting", "compliance"]) {
    // Ninja routers are named <app>_router (reporting also has a v2 router).
    const appPrefixes = Object.entries(prefixes)
      .filter(([router]) => router.startsWith(app))
      .map(([, prefix]) => prefix)
      .join(" or ");
    for (const file of gitFiles(repoRoot, `bc_obps/${app}/api/**.py`)) {
      const entries = [];
      for (const match of read(repoRoot, file).matchAll(
        /@router\.(get|post|put|patch|delete)\(\s*"([^"]+)"([\s\S]*?)\n\)/g,
      )) {
        const [, method, route, args] = match;
        const description =
          /description\s*=\s*("""[\s\S]*?"""|"(?:[^"\\]|\\.)*")/.exec(args);
        const roles = /authorize\(\s*"([^"]+)"/.exec(args);
        const summary = description
          ? truncate(pythonStrings(description[1]).split(/(?<=\.)\s/)[0], 140)
          : "";
        entries.push(
          `- ${method.toUpperCase()} ${route}${summary ? ` – ${summary}` : ""}${roles ? ` [${roles[1]}]` : ""}`,
        );
      }
      if (!entries.length) continue;
      chunks.push({
        path: file,
        heading: `API routes (${app}, under ${appPrefixes || "/api/"})`,
        text: `Django Ninja API routes defined in ${file}. Format: METHOD path – description [roles allowed].\n${entries.join("\n")}`,
      });
    }
  }
  return chunks;
}

const INTERNAL_ROLES = [
  "cas_admin",
  "cas_analyst",
  "cas_director",
  "cas_view_only",
];
const INDUSTRY_ROLES = ["industry_user", "industry_user_admin"];

// Writes a role set compactly: "internal" and "industry" stand for the full groups.
function formatRoles(roles) {
  const left = new Set(roles);
  const parts = [];
  for (const [label, group] of [
    ["internal", INTERNAL_ROLES],
    ["industry", INDUSTRY_ROLES],
  ]) {
    if (group.every((role) => left.has(role))) {
      parts.push(label);
      group.forEach((role) => left.delete(role));
    }
  }
  return [...parts, ...[...left].sort()].join(", ");
}

const roleKey = (roles) => [...roles].sort().join(",");

function newNode() {
  return {
    children: new Map(),
    isPage: false,
    pageRoles: new Set(),
    allRoles: new Set(),
  };
}

// Collects a zone's page.tsx files into a tree of route segments.
function pageTree(repoRoot, zone) {
  const prefix = `bciers/apps/${zone.app}/${zone.appDir}/`;
  const root = newNode();
  for (const file of gitFiles(repoRoot, `${prefix}**/page.tsx`)) {
    const segments = file
      .slice(prefix.length)
      .split("/")
      .slice(0, -1)
      .filter((segment) => !/^\(.*\)$/.test(segment));
    let role = "";
    if (["bceidbusiness", "idir"].includes(segments[0])) {
      role = segments[1];
      segments.splice(0, 2);
    }
    let node = root;
    if (role) node.allRoles.add(role);
    for (const segment of segments) {
      if (!node.children.has(segment)) node.children.set(segment, newNode());
      node = node.children.get(segment);
      if (role) node.allRoles.add(role);
    }
    node.isPage = true;
    if (role) node.pageRoles.add(role);
  }
  return root;
}

// Prints the tree with folder chains joined ("a/b/") and roles shown only where they change.
function printTree(node, depth, inherited, out) {
  for (const [segment, start] of [...node.children.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    let name = segment;
    let child = start;
    while (!child.isPage && child.children.size === 1) {
      const [nextName, next] = [...child.children.entries()][0];
      name += `/${nextName}`;
      child = next;
    }
    const roles = child.isPage ? child.pageRoles : child.allRoles;
    const shown =
      roles.size && roleKey(roles) !== inherited
        ? ` (${formatRoles(roles)})`
        : "";
    out.push(
      `${"  ".repeat(depth)}- ${name}${child.isPage ? "" : "/"}${shown}`,
    );
    printTree(child, depth + 1, roles.size ? roleKey(roles) : inherited, out);
  }
}

function pagesSection(repoRoot) {
  const out = [
    "## Frontend: pages by zone",
    "",
    "Each zone is its own Next.js app (multi-zone). Paths are relative to the zone's basePath. Page files live under an identity-provider/role folder (bceidbusiness/<role> or idir/<role>) and route groups `(x)` are left out. Entries are in alphabetical order, not workflow order. A name ending in / is a folder without its own page. Roles in parentheses apply to that entry and everything below it until a new list appears; internal = cas_admin, cas_analyst, cas_director, cas_view_only; industry = industry_user, industry_user_admin.",
    "",
  ];
  for (const zone of ZONES) {
    const root = pageTree(repoRoot, zone);
    const roles = root.isPage ? root.pageRoles : root.allRoles;
    out.push(
      `### ${zone.app} (${zone.basePath || "/"}, bciers/apps/${zone.app}/${zone.appDir}/)${
        roles.size ? ` (${formatRoles(roles)})` : ""
      }`,
      "",
    );
    if (root.isPage) out.push("- / (zone home page)");
    printTree(root, 0, roleKey(roles), out);
    out.push("");
  }
  return out;
}

// Finds `export enum` and `export const enum` blocks in tracked frontend files.
function enumChunks(repoRoot) {
  const files = gitFiles(
    repoRoot,
    "bciers/apps/**.ts",
    "bciers/apps/**.tsx",
    "bciers/libs/**.ts",
    "bciers/libs/**.tsx",
  ).filter((file) => !/(\.test\.|\/tests?\/|e2e|\/mocks?\/)/.test(file));
  const chunks = [];
  for (const file of files) {
    const source = read(repoRoot, file);
    const entries = [];
    for (const match of source.matchAll(
      /export (?:const )?enum (\w+)\s*\{([\s\S]*?)\}/g,
    )) {
      const values = match[2]
        .split(/,|\n/)
        .map((member) => member.trim())
        .filter((member) => member && !member.startsWith("//"))
        .map((member) => {
          const quoted = /=\s*["'`]([^"'`]*)["'`]/.exec(member);
          return quoted ? quoted[1] : member.split("=")[0].trim();
        });
      if (values.length)
        entries.push(`- ${formatChoices({ name: match[1], values })}`);
    }
    if (!entries.length) continue;
    const area = file.split("/").slice(1, 3).join("/");
    chunks.push({
      path: file,
      heading: `Frontend enums (${area})`,
      text: `TypeScript enums exported from ${file}:\n${entries.join("\n")}`,
    });
  }
  return chunks;
}

function overviewSection(repoRoot) {
  const libs = gitFiles(repoRoot, "bciers/libs/*/project.json").map(
    (file) => file.split("/")[2],
  );
  return [
    "# BCIERS codebase map",
    "",
    "Generated by bciers/scripts/build-codebase-map.mjs from the repository (no model calls). Use it to know where things live, what the domain objects are, and which pages each role has. API routes and frontend enums aren't listed here: the ones that match a question are included with the excerpts.",
    "",
    "## Overview",
    "",
    "- BCIERS (B.C. Industrial Emissions Reporting System) supports the B.C. Output-Based Pricing System (OBPS): operators register operations and facilities, submit annual emissions reports, and meet compliance obligations (pay, use credits, penalties).",
    "- Backend: Django + Django Ninja API in bc_obps/, PostgreSQL with row-level security (bc_obps/rls/). Django apps: " +
      DJANGO_APPS.join(", ") +
      ".",
    "- Frontend: Nx monorepo in bciers/ with five Next.js zones (" +
      ZONES.map(
        (zone) => `${zone.app}${zone.basePath ? ` ${zone.basePath}` : " /"}`,
      ).join(", ") +
      "). Forms use RJSF (react-jsonschema-form); UI uses MUI and Tailwind. Auth: NextAuth with Keycloak (IDIR for government users, BCeID Business for industry users).",
    `- Shared frontend libs (bciers/libs/): ${libs.join(", ")}.`,
    "- Zones and ports: " +
      ZONES.map(
        (zone) =>
          `${zone.app} (bciers/apps/${zone.app}/${zone.appDir}/, port ${zone.port})`,
      ).join(", ") +
      ".",
    "- Roles: industry users (industry_user, industry_user_admin) work for an operator; internal users (cas_admin, cas_analyst, cas_director, cas_view_only) administer the program; cas_pending is awaiting access.",
    "",
  ];
}

/**
 * @returns `map`: markdown lines for every prompt; `chunks`: searchable
 * `{ path, heading, text }` excerpts for the docs index.
 */
export function buildCodebaseMap(repoRoot) {
  return {
    map: [
      ...overviewSection(repoRoot),
      ...pagesSection(repoRoot),
      ...djangoSection(repoRoot),
    ],
    chunks: [...apiChunks(repoRoot), ...enumChunks(repoRoot)],
  };
}
