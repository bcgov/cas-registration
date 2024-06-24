import { fetchMocker } from "./global";

// To reduce code duplication and simplify mocking you can import these common mocks from this file
// and use them in your test files with custom return values
//
// import { useRouter } from "@/tests/setup/mocks";
//
// beforeEach(() => {
//   vi.clearAllMocks();
// });
//
// This can be set at the top of the test file or within the test itself
// if you need to mock different values for different tests
// useRouter.mockReturnValue({
//  query: {
//      formSection: "3",
//      operation: "test-operation-id",
//    },
//    replace: vi.fn(),
//  });
//
// To mock fetch return values refer to the vitest-fetch-mock documentation:
// https://github.com/IanVS/vitest-fetch-mock

const actionHandler = vi.fn();
const useRouter = vi.fn();
const useParams = vi.fn();
const usePathname = vi.fn();
const useSearchParams = vi.fn();
const useSession = vi.fn();
const auth = vi.fn();

export {
  actionHandler,
  fetchMocker as fetch,
  auth,
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  useSession,
};
