import fs from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { A11Y_ANNOTATION_TYPE } from "../utils/a11y";

// Collects the violations analyzeAccessibility records in A11Y_MODE=report and writes them out once the run ends:
// - a JSON file per e2e project (<outputDir>/<project>.json, e.g. bciers/a11y-results/registration-e2e.json)
//   that the CI "Accessibility report" step prints
// - a short summary in the terminal, for local runs
// This lets CI report e2e and a11y results separately without running the tests twice.

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
    const pages = result.annotations
      .filter((annotation) => annotation.type === A11Y_ANNOTATION_TYPE)
      .map(
        (annotation) =>
          JSON.parse(annotation.description ?? "{}") as A11yPageResult,
      );

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

  onEnd(_result: FullResult) {
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

    // eslint-disable-next-line no-console
    console.log(this.toTerminalSummary(results, outputFile));
  }

  private toTerminalSummary(results: A11yTestResult[], outputFile: string) {
    const lines = results.flatMap(({ test, pages }) =>
      pages.flatMap(({ page, violations }) =>
        violations.map(
          (violation) =>
            `  - [${violation.impact ?? "unknown"}] ${violation.id} (${violation.targets.length} nodes) on "${page}" in ${test}`,
        ),
      ),
    );
    const header =
      lines.length === 0
        ? `♿ ${this.projectName}: no accessibility violations found.`
        : `♿ ${this.projectName}: ${lines.length} accessibility violation(s):`;
    return [
      "",
      header,
      ...lines,
      `  Results: ${path.relative(process.cwd(), outputFile)}`,
      "",
    ].join("\n");
  }

  printsToStdio() {
    return false;
  }
}

export default A11yReporter;
