import { setupTest } from "./setupTest";

export function setupBeforeAllTest(role: string) {
  return setupTest(role, "beforeAll");
}
