import { render, screen } from "@testing-library/react";
import {
  getUserOperatorsPageData,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import UserOperatorsPage from "@/administration/app/components/userOperators/UserOperatorsPage";
import { expect } from "vitest";
import { UserOperatorStatus } from "@bciers/utils/src/enums";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock(
  "@/administration/app/components/userOperators/getUserOperatorsPageData",
  () => ({
    default: getUserOperatorsPageData,
  }),
);

const mockResponse = {
  rows: [
    {
      id: 1,
      user_friendly_id: "1",
      status: UserOperatorStatus.APPROVED,
      user__first_name: "John",
      user__last_name: "Doe",
      user__email: "john.doe@example.com",
      user__bceid_business_name: "John Doe Inc.",
      operator__legal_name: "FakeOperator 1",
    },
    {
      id: 2,
      user_friendly_id: "2",
      status: UserOperatorStatus.PENDING,
      user__first_name: "Jane",
      user__last_name: "Smith",
      user__email: "jane.smith@example.com",
      user__bceid_business_name: "Jane Smith Inc.",
      operator__legal_name: "FakeOperator 2",
    },
  ],
  row_count: 2,
};

describe("User Operators (External Access Requests) Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders UserOperatorsPage with the note on top of the page", async () => {
    getUserOperatorsPageData.mockReturnValueOnce({
      data: [],
      row_count: 0,
    });
    render(await UserOperatorsPage({ searchParams: {} }));
    expect(screen.getByTestId("note")).toBeVisible();
    expect(
      screen.getByText(
        /once "approved", the user will have access to their operator dashboard with full admin permissions,and can grant access and designate permissions to other authorized users there\./i,
      ),
    ).toBeVisible();
    expect(screen.queryByRole("grid")).toBeInTheDocument();
    expect(screen.getByText(/No records found/i)).toBeVisible();
  });
  it("renders UserOperatorsPage that correctly handle a non-empty data array", async () => {
    getUserOperatorsPageData.mockReturnValueOnce(mockResponse);
    render(await UserOperatorsPage({ searchParams: {} }));
    expect(screen.queryByRole("grid")).toBeInTheDocument();
    const allRows = screen.getAllByRole("row");
    expect(allRows).toHaveLength(4); // 2 rows + 1 header + 1 filter row
  });
  it("renders the appropriate error component when getUserOperatorsPageData fails", async () => {
    getUserOperatorsPageData.mockReturnValueOnce(undefined);
    expect(async () =>
      render(await UserOperatorsPage({ searchParams: {} })),
    ).rejects.toThrow("Failed to retrieve admin requests.");
  });
});
