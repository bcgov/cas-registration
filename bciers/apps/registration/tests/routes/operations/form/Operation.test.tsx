import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { actionHandler, useParams, useSession } from "@/tests/setup/mocks";
import { QueryParams, Session } from "@/tests/setup/types";
import Operation from "@/app/components/operations/Operation";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
} as Session);

useParams.mockReturnValue({
  formSection: "1",
  operation: "create",
} as QueryParams);

describe("Operation component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // mock getUserFormData response
    actionHandler.mockReturnValueOnce({
      first_name: "bc-cas-dev",
      last_name: "Industry User",
      position_title: "Code Monkey",
      email: "email@email.com",
      phone_number: "+16044015432",
      bceid_business_name: "Existing Operator 2 Legal Name",
      app_role: { role_name: "industry_user" },
      error: null,
    });

    // mock getNaicsCodes response
    actionHandler.mockReturnValueOnce([
      {
        id: 1,
        naics_code: "211110",
        naics_description: "Oil and gas extraction (except oil sands)",
      },
      {
        id: 2,
        naics_code: "212114",
        naics_description: "Bituminous coal mining",
      },
    ]);

    // mock getRegulatedProducts response
    actionHandler.mockReturnValueOnce([
      { id: 1, name: "BC-specific refinery complexity throughput" },
      { id: 2, name: "Cement equivalent" },
    ]);
  });

  it("renders the dropdown options for fields that require a fetch (e.g. NAICS codes)", async () => {
    render(await Operation({ numRow: undefined }));

    const naicsCode = screen.getByPlaceholderText(/NAICS code/i).closest("div");
    expect(naicsCode).toBeInTheDocument();

    act(() => {
      naicsCode?.click();
    });

    const naicsCodeOptions = screen.getAllByRole("combobox");
    expect(screen.getByText(/211110/i)).toBeVisible();
    expect(screen.getByText(/212114/i)).toBeVisible();
    expect(naicsCodeOptions).toHaveLength(3); // 2 options + empty string

    // check Regulated Products came in properly
    const regulatedProducts = screen
      .getByPlaceholderText(/Regulated Products/i)
      .closest("div");
    expect(regulatedProducts).toBeInTheDocument();

    act(() => {
      regulatedProducts?.click();
    });

    const regulatedProductsOptions = screen.getAllByRole("combobox");
    expect(
      screen.getByText(/BC-specific refinery complexity throughput/i),
    ).toBeVisible();
    expect(regulatedProductsOptions).toHaveLength(3); // 2 options + empty string
  });

  it("renders a blank form when there is no existing form data", async () => {
    render(await Operation({ numRow: undefined }));

    expect(screen.getByLabelText(/Operation Name+/i)).not.toHaveValue();
  });

  it("renders existing form data for existing operations", async () => {
    // mock getOperation response
    actionHandler.mockReturnValueOnce({
      id: "9a8aae6a-d711-42d4-aa7a-c8d37ff814c4",
      name: "Operation 3",
      type: "Single Facility Operation",
      opt_in: false,
      regulated_products: [],
      previous_year_attributable_emissions: null,
      status: "Approved",
      naics_code_id: 21,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone_number: "+16044011234",
      position_title: "Senior Officer",
      street_address: "123 Main St",
      municipality: "Cityville",
      province: "ON",
      postal_code: "A1B 2C3",
      statutory_declaration: null,
      bc_obps_regulated_operation: "21-0001",
      bcghg_id: "23219990003",
    });

    render(await Operation({ numRow: "9a8aae6a-d711-42d4-aa7a-c8d37ff814c4" }));

    waitFor(() => {
      expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue(
        "Operation 3",
      );
    });
  });
});
