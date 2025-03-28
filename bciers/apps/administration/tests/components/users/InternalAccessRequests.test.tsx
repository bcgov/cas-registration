import { getInternalAccessRequests } from "./mocks";
import { render, screen } from "@testing-library/react";
import InternalAccessRequests from "apps/administration/app/components/users/InternalAccessRequests";
import { useSearchParams } from "@bciers/testConfig/mocks";

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
    getInternalAccessRequests.mockResolvedValueOnce({ error: "some error" });
    await expect(async () => {
      render(await InternalAccessRequests());
    }).rejects.toThrow("Failed to retrieve internal access requests.");
  });
  it("renders Internal Access Requests component", async () => {
    getInternalAccessRequests.mockResolvedValueOnce(mockResponse);
    console.log(
      "------------getInternalAccessRequests",
      getInternalAccessRequests,
    );
    console.log("mockResponse", mockResponse);
    render(await InternalAccessRequests());
    expect(screen.getByRole("grid")).toBeVisible();
  });
});
