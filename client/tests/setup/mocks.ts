const mocks = {
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

export default mocks;
