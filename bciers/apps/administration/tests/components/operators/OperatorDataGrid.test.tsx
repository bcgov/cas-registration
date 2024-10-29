import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import OperatorDataGrid from "apps/administration/app/components/operators/OperatorDataGrid";
import React from "react";
import { UUID } from "crypto";

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
      id: "5c847c75-3b17-414c-97f8-88ba81cb3821" as UUID,
      legal_name: "Operator 1 Legal Name",
      business_structure: "Sole Proprietorship",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "abc1234567",
    },
    {
      id: "4a792f0f-cf9d-48c8-9a95-f504c5f84b12" as UUID,
      legal_name: "Existing Operator 2 Legal Name",
      business_structure: "General Partnership",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "def1234567",
    },
    {
      id: "685d581b-5698-411f-ae00-de1d97334a71" as UUID,
      legal_name: "New Operator 3 Legal Name",
      business_structure: "BC Corporation",
      cra_business_number: "123456789",
      bc_corporate_registry_number: "ghi1234567",
    },
  ],
  row_count: 2,
};

describe("OperatorDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the OperatorsDataGrid grid for internal users", async () => {
    render(<OperatorDataGrid initialData={mockResponse} />);

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Legal Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Business Structure" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "CRA Business Number" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", {
        name: "BC Corporate Registry Number",
      }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(4);

    // Check data displays
    expect(screen.getByText(/Operator 1 Legal Name/i)).toBeVisible();
    expect(screen.getByText(/Sole Proprietorship/i)).toBeVisible();
    expect(screen.getAllByText(/123456789/i)).toHaveLength(3);
    expect(screen.getByText(/abc1234567/i)).toBeVisible();

    const actionCells = screen.getAllByRole("link", { name: /View Details/i });
    expect(actionCells).toHaveLength(3);
    expect(actionCells[0]).toHaveAttribute(
      "href",
      "/operators/5c847c75-3b17-414c-97f8-88ba81cb3821/operator-details",
    );
    expect(actionCells[1]).toHaveAttribute(
      "href",
      "/operators/4a792f0f-cf9d-48c8-9a95-f504c5f84b12/operator-details",
    );
    expect(actionCells[2]).toHaveAttribute(
      "href",
      "/operators/685d581b-5698-411f-ae00-de1d97334a71/operator-details",
    );
  });
});
