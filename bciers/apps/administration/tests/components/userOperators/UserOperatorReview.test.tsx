import { render, screen } from "@testing-library/react";
import { auth } from "@bciers/testConfig/mocks";
import { getBusinessStructures } from "./mocks";
import UserOperatorReview from "apps/administration/app/components/userOperatorReviews/UserOperatorReview";

describe("UserOperatorReview component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });
  it("renders the appropriate error component when getUserOperatorReviewFormData fails", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_analyst" },
    });
    getUserOperatorReviewFormData.mockReturnValueOnce({
      error: "bad things",
    });

    await expect(async () => {
      render(
        await UserOperatorReview({
          params: {
            userOperatorReviewId: "1b06e328-715d-4642-b403-3392256d7344",
          },
        }),
      );
    }).rejects.toThrow("Failed to retrieve operator and admin information");
  });

  it("renders the user operator form with form data", async () => {
    // Mock auth (server components)
    auth.mockReturnValueOnce({
      user: { app_role: "cas_analyst" },
    });
    // Mock session (used in the child client component)
    useSession.mockReturnValue({
      get: vi.fn(),
      data: { user: { app_role: "cas_analyst" } },
    });
    // mock business structures for form dropdown
    getBusinessStructures.mockReturnValueOnce([
      { name: "General Partnership" },
      { name: "BC Corporation" },
      { name: "Extra Provincially Registered Company" },
    ]);
    //   mock form data
    getUserOperatorReviewFormData.mockReturnValueOnce({
      legal_name: "Test Operator Name",
      cra_business_number: 987654326,
      bc_corporate_registry_number: "stu1234567",
      business_structure: "BC Corporation",
      street_address: "789 Oak St",
      municipality: "Village",
      province: "BC",
      postal_code: "M2N 3P4",
      operator_has_parent_operators: false,
      parent_operators_array: [],
      operator_has_partner_operators: false,
      partner_operators_array: [],
      first_name: "Test User First Name",
      last_name: "3",
      email: "test1@email.com",
      phone_number: "+16044015432",
      position_title: "Code Monkey",
      bceid_business_name: "Example Business",
      role: "pending",
      status: "Pending",
    });
    render(
      await UserOperatorReview({
        params: {
          userOperatorReviewId: "1b06e328-715d-4642-b403-3392256d7344",
        },
      }),
    );
    expect(screen.getByText(/Test Operator Name/i)).toBeVisible();
    expect(screen.getByText(/Test User First Name/i)).toBeVisible();
  });
});
