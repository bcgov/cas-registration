import { render, screen } from "@testing-library/react";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";
import Operations from "@/app/components/operations/Operations";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "cas_admin",
    },
  },
} as Session);

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("Operations component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the Operations grid", async () => {
    actionHandler.mockReturnValueOnce({
      data: [
        {
          id: "1",
          bc_obps_regulated_operation: "1",
          operator: "1",
          submission_date: "2021-10-01T00:00:00",
          status: "Not Started",
          name: "Operation 1",
          bcghg_id: "1",
        },
        {
          id: "2",
          bc_obps_regulated_operation: "2",
          operator: "2",
          submission_date: "2021-10-01T00:00:00",
          status: "Not Started",
          name: "Operation 2",
          bcghg_id: "2",
        },
      ],
      row_count: 2,
    });
    render(await Operations({ searchParams: {} }));

    // Check if the grid of mock data is present
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.getByText(/Operation 2/i)).toBeVisible();
    expect(screen.getAllByText(/not Started/i)).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /start registration/i }),
    ).toHaveLength(2);
  });
});
