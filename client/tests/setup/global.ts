import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "vitest";
import SessionProvider from "@/tests/setup/SessionProviderMock";
import mocks from "@/tests/setup/mocks";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

// Extend the global expect object with the custom matchers from jest-dom
expect.extend(matchers);

vi.mock("next/navigation", () => {
  return {
    useRouter: mocks.useRouter,
    useParams: mocks.useParams,
  };
});

vi.mock("next-auth/react", async () => {
  return {
    SessionProvider,
    useSession: mocks.useSession,
  };
});

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/app/utils/actions", () => ({
  actionHandler: mocks.actionHandler,
}));
