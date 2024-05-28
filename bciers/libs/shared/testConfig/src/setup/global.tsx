import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import {
  actionHandler,
  getServerSession,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  useSession,
} from "./mocks";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

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
  usePathname,
  useSearchParams,
}));

vi.mock("next-auth/react", async () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSession,
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession,
}));

vi.mock("@/app/utils/actions", () => ({
  actionHandler,
}));

// mock fetch
export const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
