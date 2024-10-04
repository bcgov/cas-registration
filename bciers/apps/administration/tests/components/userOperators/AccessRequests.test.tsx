import { getAccessRequests } from "./mocks";
import { render, screen } from "@testing-library/react";
import AccessRequests from "apps/administration/app/components/userOperators/AccessRequests";
import { useSearchParams } from "@bciers/testConfig/mocks";

const mockResponse = [
  {
    id: "1",
    user_friendly_id: "1",
    role: "admin",
    status: "approved",
    user: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@email.com",
      user_guid: "1",
    },
    operator: {
      legal_name: "Operator 1",
    },
  },
  {
    id: "2",
    user_friendly_id: "2",
    role: "reporter",
    status: "pending",
    user: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@email.com",
      user_guid: "2",
    },
    operator: {
      legal_name: "Operator 2",
    },
  },
];

describe("Access Requests component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("renders the appropriate error message when fetching Access Requests fails", async () => {
    getAccessRequests.mockResolvedValueOnce({ error: "some error" });
    await expect(async () => {
      render(await AccessRequests());
    }).rejects.toThrow("Failed to retrieve access requests.");
  });
  it("renders Access Requests component", async () => {
    getAccessRequests.mockResolvedValueOnce(mockResponse);
    render(await AccessRequests());
    expect(screen.getByRole("grid")).toBeVisible();
  });
});
