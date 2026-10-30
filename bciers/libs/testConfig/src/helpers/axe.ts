import type { AxeResults, RunOptions, Spec } from "axe-core";
import { expect } from "vitest";
// @ts-expect-error -- jest-axe ships no types (@types/jest-axe is unmaintained and pulls in axe-core 3 and @types/jest)
import * as jestAxe from "jest-axe";

type Axe = (
  html: Element | string,
  options?: RunOptions,
) => Promise<AxeResults>;
type ConfigureAxe = (options?: RunOptions & { globalOptions?: Spec }) => Axe;

export const toHaveNoViolations: {
  toHaveNoViolations(results: AxeResults): {
    pass: boolean;
    message(): string;
  };
} = jestAxe.toHaveNoViolations;

// Every test is already checked after it finishes (see global.tsx). Call this directly to check a specific
// state mid-test, e.g. an open modal: expect(await axe(container)).toHaveNoViolations();
// jest-axe disables colour contrast (jsdom can't compute colours). `region` (all content inside landmarks)
// only makes sense for full pages, not components rendered on their own
export const axe = (jestAxe.configureAxe as ConfigureAxe)({
  rules: { region: { enabled: false } },
});

let skipped: string[] | "all" | undefined;

// Opt the current test out of the automatic a11y check, either entirely or for the given axe rule ids only.
// Call it inside the test (or in a beforeEach for a whole file) and say why, e.g.
//   skipA11yCheck(["label"]); // widget is rendered without the RJSF field template that provides its label
export const skipA11yCheck = (ruleIds?: string[]) => {
  skipped = ruleIds ?? "all";
};

// Run after every test by global.tsx
export const checkA11yAfterTest = async () => {
  const skip = skipped;
  skipped = undefined;
  if (skip === "all" || !document.body.innerHTML.trim()) return;
  const rules = Object.fromEntries(
    (skip ?? []).map((id) => [id, { enabled: false }]),
  );
  expect(await axe(document.body, { rules })).toHaveNoViolations();
};
