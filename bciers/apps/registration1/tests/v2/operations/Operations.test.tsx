import { render, screen } from "@testing-library/react";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";
import Operations from "apps/registration/app/components/operations/Operations";
import { FrontEndRoles } from "@/app/utils/enums";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  data: [
    {
      id: 1,
      operator: "FakeOperator",
      name: "Operation 1",
      bcghg_id: "1-211113-0001",
      type: "Single Facility Operation",
    },
    {
      id: 2,
      operator: "FakeOperator",
      name: "Operation 2",
      bcghg_id: "2",
      type: "Linear Facility Operation",
    },
  ],
  row_count: 2,
};

describe("Operations component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    actionHandler.mockReturnValue(mockResponse);
  });
  it("renders the Operations grid for external users", async () => {
    render(
      await Operations({ searchParams: {}, role: FrontEndRoles.INDUSTRY_USER }),
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Action" })).toBeVisible();

    // Check data displays
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(0);
    expect(screen.getByText(/1-211113-0001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility Operation/i)).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
  });

  it("renders the Operations grid for internal users", async () => {
    render(
      await Operations({ searchParams: {}, role: FrontEndRoles.CAS_ADMIN }),
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Action" })).toBeVisible();

    // Check data displays
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(2);
    expect(screen.getByText(/1-211113-0001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility Operation/i)).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
  });
});
