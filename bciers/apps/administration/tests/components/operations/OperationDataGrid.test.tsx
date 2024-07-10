import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import OperationDataGrid from "@/administration/app/components/operations/OperationDataGrid";
import React from "react";

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

describe("OperationsDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the OperationsDataGrid grid for external users", async () => {
    render(
      <OperationDataGrid isInternalUser={false} initialData={mockResponse} />,
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
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check data displays
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(0);
    expect(screen.getByText(/1-211113-0001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility Operation/i)).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
  });

  it("renders the OperationsDataGrid grid for external users", async () => {
    render(
      <OperationDataGrid isInternalUser={true} initialData={mockResponse} />,
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Action" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(4);

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
