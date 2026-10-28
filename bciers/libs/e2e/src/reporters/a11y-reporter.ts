import fs from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { A11Y_ATTACHMENT_PREFIX } from "../utils/a11y";

// Collects the violations analyzeAccessibility records in A11Y_MODE=report and, once the run ends, writes them to
// a JSON file per e2e project (<outputDir>/<project>.json, e.g. bciers/a11y-results/registration-e2e.json).
// The CI "♿ accessibility" check prints that file, so e2e and a11y results are reported separately
// without running the tests twice.

// Options, passed from the playwright config: [reporterPath, { outputDir }]
// (see https://playwright.dev/docs/test-reporters)
interface A11yReporterOptions {
  // Folder for the results; each e2e project writes <project>.json into it. Defaults to ./a11y-results
  outputDir?: string;
  // Exact results file; overrides outputDir. The A11Y_RESULTS_FILE env var overrides both
  outputFile?: string;
}

interface A11yPageResult {
  page: string;
  url: string;
  violations: {
    id: string;
    impact?: string | null;
    help: string;
    helpUrl: string;
    targets: string[];
  }[];
}

// Shape of the "a11y-<page>.json" attachment: the page plus the full axe violations
interface A11yAttachment {
  page: string;
  url: string;
  violations: {
    id: string;
    impact?: string | null;
    help: string;
    helpUrl: string;
    nodes: { target: string[] }[];
  }[];
}

// Keep only what the results file needs from the full axe details
const toPageResult = (body: string): A11yPageResult => {
  const { page, url, violations }: A11yAttachment = JSON.parse(body);
  return {
    page,
    url,
    violations: violations.map(({ id, impact, help, helpUrl, nodes }) => ({
      id,
      impact,
      help,
      helpUrl,
      targets: nodes.map((node) => node.target.join(" ")),
    })),
  };
};

interface A11yTestResult {
  test: string;
  file: string;
  pages: A11yPageResult[];
}

class A11yReporter implements Reporter {
  // Keyed by test id so a retry replaces the earlier attempt instead of being counted twice
  private readonly results = new Map<string, A11yTestResult>();
  // e2e project name, taken from the folder of the playwright config (e.g. "registration-e2e")
  private projectName = "e2e";

  constructor(private readonly options: A11yReporterOptions = {}) {}

  onBegin(config: FullConfig) {
    if (config.configFile)
      this.projectName = path.basename(path.dirname(config.configFile));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const pages = result.attachments
      .filter(
        (attachment) =>
          attachment.name.startsWith(A11Y_ATTACHMENT_PREFIX) && attachment.body,
      )
      .map((attachment) => toPageResult(attachment.body!.toString()));

    if (pages.length === 0) {
      this.results.delete(test.id);
      return;
    }

    this.results.set(test.id, {
      test: test.titlePath().filter(Boolean).join(" › "),
      file: path.relative(process.cwd(), test.location.file),
      pages,
    });
  }

  onEnd() {
    const results = [...this.results.values()];
    const outputFile =
      process.env.A11Y_RESULTS_FILE ??
      this.options.outputFile ??
      path.join(
        this.options.outputDir ?? "a11y-results",
        `${this.projectName}.json`,
      );
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }

  printsToStdio() {
    return false;
  }
}

export default A11yReporter;
