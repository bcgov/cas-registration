import { render, screen, within } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import { UserOperatorStatus } from "@bciers/utils/src/enums";
import UserOperatorDataGrid from "@/administration/app/components/userOperators/UserOperatorDataGrid";
import { expect } from "vitest";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

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
    {
      id: 3,
      user_friendly_id: "3",
      status: UserOperatorStatus.DECLINED,
      user__first_name: "Alice",
      user__last_name: "Brown",
      user__email: "alice.brown@example.com",
      user__bceid_business_name: "Alice Brown Inc.",
      operator__legal_name: "FakeOperator 3",
    },
    {
      id: 4,
      user_friendly_id: "4",
      status: UserOperatorStatus.APPROVED,
      user__first_name: "Bob",
      user__last_name: "White",
      user__email: "bob.white@example.com",
      user__bceid_business_name: "Bob White Inc.",
      operator__legal_name: "FakeOperator 4",
    },
  ],
  row_count: 4,
};

describe("UserOperatorDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the UserOperatorDataGrid grid", async () => {
    render(<UserOperatorDataGrid initialData={mockResponse} />);

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Request ID" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "First Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Last Name" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BCeID Business Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operator" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();

    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(7);

    // Check data displays
    const allRows = screen.getAllByRole("row");
    expect(allRows).toHaveLength(6); // 4 rows + 1 header + 1 filter row
    const firstUserOperatorRow = allRows[2]; // first row of data
    expect(within(firstUserOperatorRow).getByText("1")).toBeVisible();
    expect(within(firstUserOperatorRow).getByText("John")).toBeVisible();
    expect(within(firstUserOperatorRow).getByText("Doe")).toBeVisible();
    expect(
      within(firstUserOperatorRow).getByText(/admin access/i),
    ).toBeVisible();
    expect(
      within(firstUserOperatorRow).getByText(/john.doe@example.com/i),
    ).toBeVisible();
    expect(
      within(firstUserOperatorRow).getByText(/John Doe Inc./i),
    ).toBeVisible();
    expect(
      within(firstUserOperatorRow).getByText(/FakeOperator 1/i),
    ).toBeVisible();
    expect(screen.getAllByText(/view details/i)).toHaveLength(4);
    expect(screen.getAllByText(/view details/i)[0]).toHaveAttribute(
      "href",
      "/operator-administrators-and-access-requests/1?title=Request ID: 1",
    );
  });
});
