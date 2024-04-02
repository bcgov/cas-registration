import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "vitest";
import SessionProvider from "@/tests/setup/SessionProviderMock";
import {
  actionHandler,
  getServerSession,
  useParams,
  useRouter,
  useSession,
} from "@/tests/setup/mocks";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

// Extend the global expect object with the custom matchers from jest-dom
expect.extend(matchers);

vi.mock("next/navigation", () => ({
  useRouter,
  useParams,
}));

vi.mock("next-auth/react", async () => ({
  SessionProvider,
  useSession,
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession,
}));

vi.mock("@/app/utils/actions", () => ({
  actionHandler,
}));
