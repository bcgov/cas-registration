/* eslint-disable import/no-extraneous-dependencies */
// TODO(Nx Migration): Module added to Monorepo at `bciers/libs/shared/testConfig/src/setup/global.ts`

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import {
  actionHandler,
  auth,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
  useSession,
} from "@/tests/setup/mocks";
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
  auth,
}));

vi.mock("@/app/utils/actions", () => ({
  actionHandler,
}));

// mock fetch
export const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
