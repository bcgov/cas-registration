import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import * as matchers from "@testing-library/jest-dom/matchers";
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "vitest";
import SessionProvider from "@/tests/mocks/SessionProviderMock";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

expect.extend(matchers);

export const mocks = {
  useRouter: vi.fn(() => ({
    query: {
      formSection: "1",
      operation: "create",
    },
    replace: vi.fn(),
  })),
  useParams: vi.fn(() => ({
    formSection: "1",
    operation: "create",
  })),
  useSession: vi.fn(() => ({
    data: {
      user: {
        app_role: "cas_admin",
      },
    },
  })),
  getServerSession: vi.fn(),
};

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

// TODO: Correctly mock cookies to remove stderr warnings
// vi.mock("next/headers", () => ({
//   cookies: vi.fn(),
// }));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => Promise.resolve()),
  revalidatePath: vi.fn(() => Promise.resolve()),
}));
