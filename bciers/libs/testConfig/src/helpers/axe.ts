import type { AxeResults, RunOptions, Spec } from "axe-core";
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
