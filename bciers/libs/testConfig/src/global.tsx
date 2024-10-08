/* eslint-disable import/no-extraneous-dependencies*/
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";
import {
  actionHandler,
  auth,
  getToken,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  useSession,
  notFound,
} from "./mocks";
import createFetchMock from "vitest-fetch-mock";

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
  notFound,
}));

vi.mock("next-auth/react", async () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession,
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  auth,
}));

vi.mock("@/dashboard/auth", () => ({
  auth,
}));

vi.mock("@bciers/actions", () => ({
  actionHandler,
  getToken,
}));

// mock fetch
export const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
