// docs-site/sync-docs.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, "../docs");
// Changing target to the true Starlight root
const TARGET_DIR = path.join(__dirname, "src/content/docs");

const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
];

/**
 * Converts any string (camelCase, snake_case, spaces) into clean kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Split camelCase
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .toLowerCase();
}

/**
 * Dynamically converts GitHub-friendly markdown links to Starlight-friendly routing links
 */
function transformMarkdownLinks(content) {
  // Regex to match Markdown links: [Text](url)
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Ignore absolute URLs (http://, https://, mailto:, etc.)
    if (url.match(/^[a-z0-9+.-]+:/i)) {
      return match;
    }

    // Split out any hash anchors (e.g., ./file.md#section-name)
    let [linkPath, hash] = url.split("#");
    hash = hash ? `#${hash}` : "";

    if (linkPath.endsWith(".md")) {
      if (path.basename(linkPath) === "README.md") {
        // Point README.md links to the directory's index path
        linkPath = linkPath.replace(/README\.md$/, "./");
      } else {
        // Strip the .md extension so Starlight's router treats it as a clean URL route
        linkPath = linkPath.slice(0, -3);
      }
    }

    return `[${text}](${linkPath}${hash})`;
  });
}

function syncDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source, { withFileTypes: true });

  items.forEach((item) => {
    const sourcePath = path.join(source, item.name);

    // Core adjustment: If the file is README.md, name it index.md inside Astro
    const cleanName = toKebabCase(path.basename(item.name, ".md")) + ".md";
    const targetName = item.name === "README.md" ? "index.md" : cleanName;
    const targetPath = path.join(target, targetName);

    if (item.isDirectory()) {
      syncDirectory(sourcePath, targetPath);
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();

      if (ext === ".md") {
        let content = fs.readFileSync(sourcePath, "utf8");

        // 1. Inject missing frontmatter titles
        if (!content.startsWith("---")) {
          const h1Match = content.match(/^#\s+(.+)$/m);
          const title = h1Match
            ? h1Match[1].trim()
            : path.basename(item.name, ".md");
          const safeTitle = title.replace(/"/g, '\\"');

          // Special configuration if this is the root home page
          const isRootIndex =
            item.name === "README.md" && source === SOURCE_DIR;
          const templateConfig = isRootIndex
            ? "\ntemplate: splash\neditUrl: false"
            : "";

          content = `---\ntitle: "${safeTitle}"${templateConfig}\n---\n\n${content}`;
        }

        // 2. Automatically transform links on the fly
        content = transformMarkdownLinks(content);

        fs.writeFileSync(targetPath, content);
      } else if (IMAGE_EXTENSIONS.includes(ext)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });
}

// Wipe out the target directory to prevent legacy cached files
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
}

console.log(
  "🔄 Syncing docs, rewriting .md paths, and updating homepage index...",
);
syncDirectory(SOURCE_DIR, TARGET_DIR);
console.log("✅ Local pipeline built successfully!");
