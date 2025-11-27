import { setupTest } from "./setupTest";

export function setupBeforeEachTest(role: string) {
  return setupTest(role, "beforeEach");
}
