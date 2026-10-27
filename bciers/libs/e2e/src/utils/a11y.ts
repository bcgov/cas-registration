import { Page, expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Accessibility (a11y) checks for e2e tests, run with axe-core.
// See docs/frontend/testing/playwright.md#accessibility-testing-with-playwright-and-axe

// In A11Y_MODE=report, for each scanned page with violations, analyzeAccessibility adds an "a11y" annotation
// (the page and a bullet per violation, shown at the top of the test in the HTML report) and an "a11y-<page>.json"
// attachment with the full axe details.
// The attachment is what the a11y reporter (libs/e2e/src/reporters/a11y-reporter.ts) reads
export const A11Y_ANNOTATION_TYPE = "a11y";
export const A11Y_ATTACHMENT_PREFIX = "a11y-";

type AxeViolation = Awaited<
  ReturnType<AxeBuilder["analyze"]>
>["violations"][number];

export type A11yMode = "fail" | "report" | "off";

export interface AnalyzeAccessibilityOptions {
  // axe rule ids to skip, e.g. ["empty-table-header"]
  disableRules?: string[];
  // CSS selectors to leave out of the scan (e.g. third-party widgets we can't fix)
  exclude?: string[];
  // CSS selectors to limit the scan to; defaults to the whole page
  include?: string[];
}

// fail (default): violations fail the test right away - best for local runs
// report: violations are attached to the test and collected by the a11y reporter
// off: skip the scan
export const getA11yMode = (): A11yMode => {
  const mode = process.env.A11Y_MODE?.toLowerCase();
  return mode === "report" || mode === "off" ? mode : "fail";
};

// 🛠️ Function: turn axe violations into a short, readable summary
export const formatViolations = (violations: AxeViolation[]) =>
  violations
    .map(
      (violation) =>
        `- [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help} (${violation.helpUrl})\n` +
        violation.nodes
          .map((node) => `    ${node.target.join(" ")}`)
          .join("\n"),
    )
    .join("\n");

// 🛠️ Function: analyze the accessibility of the page. Use the description argument to indicate what screen/form/etc. is being tested.
export async function analyzeAccessibility(
  page: Page,
  description: string = "",
  { disableRules, exclude, include }: AnalyzeAccessibilityOptions = {},
) {
  const mode = getA11yMode();
  if (mode === "off") return;

  const builder = new AxeBuilder({
    page,
  });

  if (disableRules && disableRules.length > 0)
    builder.disableRules(disableRules);
  include?.forEach((selector) => builder.include(selector));
  exclude?.forEach((selector) => builder.exclude(selector));

  // Let transitions finish first (e.g. a button fading from disabled to enabled),
  // otherwise axe can check a colour mid-transition. Endless ones like spinners are skipped
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== "running" ||
          animation.effect?.getComputedTiming().endTime === Infinity,
      ),
  );

  const { violations } = await builder.analyze();
  if (violations.length === 0) return;

  const summary = formatViolations(violations);
  const label = description || page.url();

  if (mode === "fail") {
    // Assert on the rule ids, not the full violations, so the failure shows the summary instead of a huge object dump
    expect(
      violations.map((violation) => violation.id),
      `[Accessibility Violation: ${label}]\n${summary}`,
    ).toHaveLength(0);
    return;
  }

  // report mode: record the violations and let the test carry on
  const testInfo = test.info();
  // eslint-disable-next-line no-console
  console.log(`[Accessibility Violation: ${label}]\n${summary}`);
  // One annotation per scanned page: the page name, then a bullet per violation.
  // The HTML report keeps the line breaks, so it reads as a list at the top of the test
  const bullets = violations.map((violation) => {
    const elements = violation.nodes.map((node) => node.target.join(" "));
    return (
      `• [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}. ` +
      `${elements.length} element(s): ${elements.join(", ")}. ${violation.helpUrl.split("?")[0]}`
    );
  });
  testInfo.annotations.push({
    type: A11Y_ANNOTATION_TYPE,
    description: [label, ...bullets].join("\n"),
  });
  // The full axe details (each element's HTML and what to fix) for the HTML report. The a11y reporter reads this too
  await testInfo.attach(`${A11Y_ATTACHMENT_PREFIX}${label}.json`, {
    body: JSON.stringify({ page: label, url: page.url(), violations }, null, 2),
    contentType: "application/json",
  });
}
