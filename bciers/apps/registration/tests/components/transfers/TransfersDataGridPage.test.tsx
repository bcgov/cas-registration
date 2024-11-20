import { render, screen } from "@testing-library/react";
import {
  fetchTransferEventsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import TransfersDataGridPage from "@/registration/app/components/transfers/TransfersDataGridPage";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock(
  "apps/registration/app/components/transfers/fetchTransferEventsPageData",
  () => ({
    default: fetchTransferEventsPageData,
  }),
);

const mockResponse = {
  items: [
    {
      operation__id: "3b5b95ea-2a1a-450d-8e2e-2e15feed96c9",
      operation__name: "Operation 3",
      facilities__name: null,
      facility__id: null,
      id: "3b5b95ea-2a1a-450d-8e2e-2e15feed96c9",
      effective_date: "2025-02-01T09:00:00Z",
      status: "Transferred",
      created_at: "2024-07-05T23:25:37.892Z",
    },
    {
      operation__id: "d99725a7-1c3a-47cb-a59b-e2388ce0fa18",
      operation__name: "Operation 6",
      facilities__name: null,
      facility__id: null,
      id: "d99725a7-1c3a-47cb-a59b-e2388ce0fa18",
      effective_date: "2024-08-21T09:00:00Z",
      status: "To be transferred",
      created_at: "2024-07-05T23:25:37.892Z",
    },
    {
      operation__id: null,
      operation__name: null,
      facilities__name: "Facility 1",
      facility__id: "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
      id: "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
      effective_date: "2024-12-25T09:00:00Z",
      status: "Completed",
      created_at: "2024-07-05T23:25:37.892Z",
    },
    {
      operation__id: null,
      operation__name: null,
      facilities__name: "Facility 2",
      facility__id: "459b80f9-b5f3-48aa-9727-90c30eaf3a58",
      id: "459b80f9-b5f3-48aa-9727-90c30eaf3a58",
      effective_date: "2024-12-25T09:00:00Z",
      status: "Completed",
      created_at: "2024-07-05T23:25:37.892Z",
    },
  ],
  row_count: 4,
};

describe("Transfers component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("throws an error when there's a problem fetching data", async () => {
    fetchTransferEventsPageData.mockReturnValueOnce(undefined);
    await expect(async () => {
      render(await TransfersDataGridPage({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve transfers");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("renders the TransfersDataGrid component when there are transfers in the database", async () => {
    fetchTransferEventsPageData.mockReturnValueOnce(mockResponse);
    render(await TransfersDataGridPage({ searchParams: {} }));
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No transfers data in database./i),
    ).not.toBeInTheDocument();
  });
});
