import { setupTest, SetupTestOptions } from "./setupTest";

export function setupBeforeAllTest(role: string, options?: SetupTestOptions) {
  return setupTest(role, "beforeAll", options);
}
