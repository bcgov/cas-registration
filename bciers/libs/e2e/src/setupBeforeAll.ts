import { setupTest } from "./setupTest";

export function setupBeforeAllTest(role: string, workflow?: string) {
  return setupTest(role, "beforeAll", workflow);
}
