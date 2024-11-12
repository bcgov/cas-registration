import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import React from "react";
import TransfersDataGrid from "@/registration/app/components/transfers/TransfersDataGrid";

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
      id: "3b5b95ea-2a1a-450d-8e2e-2e15feed96c9",
      operation__name: "Operation 1",
      facilities__name: "N/A",
      status: "Transferred",
      created_at: "Jan 5, 2024\n4:25:37 p.m. PDT",
      effective_date: "Feb 1, 2025\n1:00:00 a.m. PST",
    },
    {
      id: "d99725a7-1c3a-47cb-a59b-e2388ce0fa18",
      operation__name: "Operation 2",
      facilities__name: "N/A",
      status: "To be transferred",
      created_at: "Jul 5, 2024\n4:25:37 p.m. PDT",
      effective_date: "Aug 21, 2024\n2:00:00 a.m. PDT",
    },
    {
      id: "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
      operation__name: "N/A",
      facilities__name: "Facility 1",
      status: "Completed",
      created_at: "Jul 5, 2024\n4:25:37 p.m. PDT",
      effective_date: "Dec 25, 2024\n1:00:00 a.m. PST",
    },
    {
      id: "459b80f9-b5f3-48aa-9727-90c30eaf3a58",
      operation__name: "N/A",
      facilities__name: "Facility 2",
      status: "Completed",
      created_at: "Jul 5, 2024\n4:25:37 p.m. PDT",
      effective_date: "Dec 25, 2024\n1:00:00 a.m. PST",
    },
  ],
  row_count: 4,
};

describe("TransfersDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the TransfersDataGrid grid ", async () => {
    render(<TransfersDataGrid initialData={mockResponse} />);

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Submission Date" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Facility" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Effective Date" }),
    ).toBeVisible();

    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    const rows = screen.getAllByRole("row"); // row 0 is headers and row 1 is filter cells

    const operation1Row = rows[2];
    expect(
      within(operation1Row).getByText("Jan 5, 2024 4:25:37 p.m. PDT"),
    ).toBeInTheDocument();
    expect(within(operation1Row).getByText("Operation 1")).toBeInTheDocument();
    expect(within(operation1Row).getByText("N/A")).toBeInTheDocument();
    expect(within(operation1Row).getByText("Transferred")).toBeInTheDocument();
    expect(
      within(operation1Row).getByText("Feb 1, 2025 1:00:00 a.m. PST"),
    ).toBeInTheDocument();
    expect(within(operation1Row).getByText("View Details")).toBeInTheDocument();

    const opeartion2Row = rows[3];
    expect(
      within(opeartion2Row).getByText("Jul 5, 2024 4:25:37 p.m. PDT"),
    ).toBeInTheDocument();
    expect(within(opeartion2Row).getByText("Operation 2")).toBeInTheDocument();
    expect(within(opeartion2Row).getByText("N/A")).toBeInTheDocument();
    expect(
      within(opeartion2Row).getByText("To be transferred"),
    ).toBeInTheDocument();
    expect(
      within(opeartion2Row).getByText("Aug 21, 2024 2:00:00 a.m. PDT"),
    ).toBeInTheDocument();
    expect(within(opeartion2Row).getByText("View Details")).toBeInTheDocument();
    const facility1Row = rows[4];

    expect(
      within(facility1Row).getByText("Jul 5, 2024 4:25:37 p.m. PDT"),
    ).toBeInTheDocument();
    expect(within(facility1Row).getByText("N/A")).toBeInTheDocument();
    expect(within(facility1Row).getByText("Facility 1")).toBeInTheDocument();
    expect(within(facility1Row).getByText("Completed")).toBeInTheDocument();
    expect(
      within(facility1Row).getByText("Dec 25, 2024 1:00:00 a.m. PST"),
    ).toBeInTheDocument();
    expect(within(facility1Row).getByText("View Details")).toBeInTheDocument();

    const facility2Row = rows[5];
    expect(
      within(facility2Row).getByText("Jul 5, 2024 4:25:37 p.m. PDT"),
    ).toBeInTheDocument();
    expect(within(facility2Row).getByText("N/A")).toBeInTheDocument();
    expect(within(facility2Row).getByText("Facility 2")).toBeInTheDocument();
    expect(within(facility2Row).getByText("Completed")).toBeInTheDocument();
    expect(
      within(facility2Row).getByText("Dec 25, 2024 1:00:00 a.m. PST"),
    ).toBeInTheDocument();
    expect(within(facility2Row).getByText("View Details")).toBeInTheDocument();
  });
});
