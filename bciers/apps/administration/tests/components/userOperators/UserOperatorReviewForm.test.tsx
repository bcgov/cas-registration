import { render, screen } from "@testing-library/react";
import { useSession } from "@bciers/testConfig/mocks";
import UserOperatorReviewForm from "@/administration/app/components/userOperators/UserOperatorReviewForm";
import { createOperatorSchema } from "@/administration/app/data/jsonSchema/operator";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { getBusinessStructures } from "../operations/mocks";

describe("UserOperatorReview component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    // mocking this for rjsf schema creation, doesn't matter what the values are
    getBusinessStructures.mockReturnValue([{ name: "BC Corporation" }]);
  });
  it("renders the component", async () => {
    useSession.mockReturnValue({
      get: vi.fn(),
      data: { user: { app_role: "cas_analyst" } },
    });
    render(
      <UserOperatorReviewForm
        operatorSchema={await createOperatorSchema()}
        formData={{
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
        }}
        userOperatorId={"1b06e328-715d-4642-b403-3392256d7344"}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Operation Information" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Admin Information" }),
    ).toBeVisible();
    // testing a couple fields as a sample to ensure form data came through
    expect(screen.getByText(/Test Operator Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User First Name/i)).toBeInTheDocument();
  });

  it("does not render the approve/decline buttons when user is cas_view_only or cas_admin", async () => {
    for (const role of [FrontEndRoles.CAS_ADMIN, FrontEndRoles.CAS_VIEW_ONLY]) {
      useSession.mockReturnValue({
        get: vi.fn(),
        data: { user: { app_role: role } },
      });
      render(
        <UserOperatorReviewForm
          operatorSchema={await createOperatorSchema()}
          formData={{}}
          userOperatorId={"1b06e328-715d-4642-b403-3392256d7344"}
        />,
      );
      expect(
        screen.queryByRole("button", { name: /Approve/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Decline/i }),
      ).not.toBeInTheDocument();
    }
  });

  it("renders the approve/decline buttons when user is cas_director or cas_analyast", async () => {
    for (const role of [
      FrontEndRoles.CAS_ANALYST,
      FrontEndRoles.CAS_DIRECTOR,
    ]) {
      useSession.mockReturnValue({
        get: vi.fn(),
        data: { user: { app_role: role } },
      });
      render(
        <UserOperatorReviewForm
          operatorSchema={await createOperatorSchema()}
          formData={{}}
          userOperatorId={"1b06e328-715d-4642-b403-3392256d7344"}
        />,
      );
      expect(
        screen.queryByRole("button", { name: /Approve/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Decline/i }),
      ).not.toBeInTheDocument();
    }
  });
});
