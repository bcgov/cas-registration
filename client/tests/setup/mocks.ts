// To return a different value for each test, you can import this file and use mockReturnValue
// to set the return value for the function you want to mock. For example:
// import mocks from "@/tests/setup/mocks";
//
// mocks.useRouter.mockReturnValue({
//  query: {
//      formSection: "3",
//      operation: "test-operation-id",
//    },
//    replace: vi.fn(),
//  });

const mocks = {
  useRouter: vi.fn(),
  useParams: vi.fn(),
  useSession: vi.fn(),
  getServerSession: vi.fn(),
};

export default mocks;
