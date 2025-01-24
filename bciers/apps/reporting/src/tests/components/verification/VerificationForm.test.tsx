import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import {
  verificationSchema,
  verificationUiSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import expectButton from "@bciers/testConfig/helpers/expectButton";
import expectField from "@bciers/testConfig/helpers/expectField";
import { fillMandatoryFields } from "@bciers/testConfig/helpers/fillMandatoryFields";

// ✨ Mocks
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

// 🏷 Constants
const config = {
  buttons: {
    cancel: "Back",
    saveAndContinue: "Save & Continue",
  },
  actionPost: {
    endPoint: "reporting/report-version/3/report-verification",
    method: "POST",
    revalidatePath: "reporting/reports",
  },
  mockVersionId: 3,
  mockRouteSubmit: `/reports/3/attachments?`,
};

// 🏷 Common Fields
const commonMandatoryFormFields = [
  {
    label: "Verification body name",
    type: "text",
    key: "verification_body_name",
  },
  { label: "Accredited by", type: "combobox", key: "accredited_by" },
  {
    label: "Scope of verification",
    type: "combobox",
    key: "scope_of_verification",
  },
  { label: "Sites visited", type: "combobox", key: "visit_name" },
  {
    label: "Were there any threats to independence noted",
    type: "radio",
    key: "threats_to_independence",
  },
  {
    label: "Verification conclusion",
    type: "combobox",
    key: "verification_conclusion",
  },
];

const specificMandatoryFields = {
  facility: [{ label: "Type of site visit", type: "radio", key: "visit_type" }],
  other: [
    { label: "Type of site visit", type: "radio", key: "visit_type" },
    {
      label: "Please indicate the site visited",
      type: "text",
      key: "other_facility_name",
    },
    {
      label: "Geographic coordinates of site",
      type: "text",
      key: "other_facility_coordinates",
    },
  ],
};

const formDataSets = {
  default: {
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "Supplementary Report",
    visit_name: "None",
    threats_to_independence: "No",
    verification_conclusion: "Positive",
  },
  facility: {
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "Supplementary Report",
    visit_name: "Facility X",
    visit_type: "Virtual",
    threats_to_independence: "No",
    verification_conclusion: "Positive",
  },
  other: {
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "Supplementary Report",
    visit_name: "Other",
    visit_type: "Virtual",
    other_facility_name: "Other Facility",
    other_facility_coordinates: "Lat 41; Long 35",
    threats_to_independence: "No",
    verification_conclusion: "Modified",
  },
};

// ⛏️ Helper function to render the form
const renderVerificationForm = () => {
  render(
    <VerificationForm
      version_id={config.mockVersionId}
      verificationSchema={verificationSchema}
      verificationUiSchema={verificationUiSchema}
      initialData={{}}
      taskListElements={[]}
    />,
  );
};

// ⛏️ Helper function to simulate form POST submission and assert the result
const submitFormAndAssert = async (
  fields: { label: string; type: string; key: string }[],
  data: Record<string, string | number | boolean>,
) => {
  actionHandler.mockReturnValueOnce({
    success: true,
  });
  await fillMandatoryFields(fields, data);
  const button = screen.getByRole("button", {
    name: config.buttons.saveAndContinue,
  });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.queryByText(/Required field/i)).not.toBeInTheDocument();
    // Assert expected behavior after submission
    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(config.mockRouteSubmit);
  });
};

// 🧪 Test suite
describe("VerificationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with correct fields", () => {
    renderVerificationForm();
    expectField(commonMandatoryFormFields.map((field) => field.label));
    expectButton(config.buttons.cancel);
    expectButton(config.buttons.saveAndContinue);
  });

  it("does not allow form submission if there are validation errors", async () => {
    renderVerificationForm();
    fireEvent.click(
      screen.getByRole("button", { name: config.buttons.saveAndContinue }),
    );

    await waitFor(() => {
      expect(screen.queryAllByText(/Required field/i)).toHaveLength(6);
    });
  });

  it(
    "fills mandatory fields for 'None' option and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      renderVerificationForm();
      // POST submit and assert the result
      await submitFormAndAssert(
        commonMandatoryFormFields,
        formDataSets.default,
      );
      // Assert if actionHandler was called correctly
      expect(actionHandler).toHaveBeenCalledWith(
        config.actionPost.endPoint,
        "POST",
        config.actionPost.revalidatePath,
        {
          body: JSON.stringify({
            verification_body_name: "Test",
            accredited_by: "SCC",
            scope_of_verification: "Supplementary Report",
            visit_name: "None",
            threats_to_independence: false,
            verification_conclusion: "Positive",
          }),
        },
      );
    },
  );

  it(
    "fills mandatory fields for 'Facility X' option and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      renderVerificationForm();
      const fields = [
        ...commonMandatoryFormFields,
        ...specificMandatoryFields.facility,
      ];
      await submitFormAndAssert(fields, formDataSets.facility);
    },
  );
  it(
    "fills mandatory fields for 'Other' option and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      renderVerificationForm();
      const fields = [
        ...commonMandatoryFormFields,
        ...specificMandatoryFields.other,
      ];
      // POST submit and assert the result
      await submitFormAndAssert(fields, formDataSets.other);
      // Assertion if actionHandler was called correctly
      expect(actionHandler).toHaveBeenCalledWith(
        config.actionPost.endPoint,
        "POST",
        config.actionPost.revalidatePath,
        {
          body: JSON.stringify({
            verification_body_name: "Test",
            accredited_by: "SCC",
            scope_of_verification: "Supplementary Report",
            visit_name: "Other",
            threats_to_independence: false,
            verification_conclusion: "Modified",
            visit_type: "Virtual",
            other_facility_name: "Other Facility",
            other_facility_coordinates: "Lat 41; Long 35",
          }),
        },
      );
    },
  );
  it("routes to the final review summary page when the Back button is clicked", () => {
    const queryString = "?"; // Update this based on your query string logic if necessary.
    const expectedRoute = `/reports/${config.mockVersionId}/final-review${queryString}`;

    renderVerificationForm();

    // Click the "Back" button
    const backButton = screen.getByRole("button", {
      name: config.buttons.cancel,
    });
    fireEvent.click(backButton);

    // Assert that the router's push method was called with the expected route
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(expectedRoute);
  });
});
