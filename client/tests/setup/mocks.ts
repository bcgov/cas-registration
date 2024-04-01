import { Query, Router, Session } from "@/tests/setup/types";

// To return a different value for each test, you can import this file and use mockReturnValue
// to set the return value for the function you want to mock. For example:
// import mocks from "@/tests/setup/mocks";
//
// mocks.useRouter.mockReturnValue({
//    query: {
//      formSection: "3",
//      operation: "test-operation-id",
//    },
//    replace: vi.fn(),
//  });

const mocks = {
  useRouter: vi.fn(
    () =>
      ({
        query: {
          formSection: "1",
          operation: "create",
        },
        replace: vi.fn(),
      }) as Router,
  ),
  useParams: vi.fn(
    () =>
      ({
        formSection: "1",
        operation: "create",
      }) as Query,
  ),
  useSession: vi.fn(
    () =>
      ({
        data: {
          user: {
            app_role: "cas_admin",
          },
        },
      }) as Session,
  ),
  getServerSession: vi.fn(),
};

export default mocks;
