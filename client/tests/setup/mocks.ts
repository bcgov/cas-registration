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

const actionHandler = vi.fn();
const useRouter = vi.fn();
const useParams = vi.fn();
const useSession = vi.fn();
const getServerSession = vi.fn();

export { actionHandler, getServerSession, useRouter, useParams, useSession };
