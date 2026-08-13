import { setupTest, SetupTestOptions } from "./setupTest";

export function setupBeforeEachTest(role: string, options?: SetupTestOptions) {
  return setupTest(role, "beforeEach", options);
}
