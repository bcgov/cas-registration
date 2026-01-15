import { render, screen } from "@testing-library/react";
import InternalAccessRequestsPage from "apps/administration/app/components/users/InternalAccessRequestsPage";
import {
  actionHandler,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";

const mockResponse = [
  {
    role: "cas_analyst",
    id: "00000000-0000-0000-0000-000000000028",
    name: "CAS ANALYST",
    email: "test2@email.com",
    archived_at: null,
  },
  {
    role: "cas_director",
    id: "00000000-0000-0000-0000-000000000029",
    name: "CAS DIRECTOR",
    email: "cas_director@email.com",
    archived_at: null,
  },
];

describe("Access Requests component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });
  it("renders the appropriate error message when fetching Internal Access Requests fails", async () => {
    // couldn't get a mock of getInternalAccessRequests to work, so using actionHandler instead
    actionHandler.mockResolvedValue({
      error: "some error",
    });
    await expect(async () => {
      render(await InternalAccessRequestsPage());
    }).rejects.toThrow("Failed to retrieve internal access requests.");
  });

  it("renders Internal Access Requests component", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });
    actionHandler.mockResolvedValue(mockResponse);

    render(await InternalAccessRequestsPage());
    expect(screen.getByRole("grid")).toBeVisible();
  });
});
