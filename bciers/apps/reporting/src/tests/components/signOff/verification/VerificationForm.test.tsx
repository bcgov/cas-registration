import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import {
  verificationSchema,
  verificationUiSchema,
} from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import VerificationForm from "@reporting/src/app/components/signOff/verification/VerificationForm";
import expectButton from "@bciers/testConfig/helpers/expectButton";
import expectField from "@bciers/testConfig/helpers/expectField";
import { fillMandatoryFields } from "@bciers/testConfig/helpers/fillMandatoryFields";

// ✨ Mock useRouter
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

// 🏷 Constants
const buttonCancel = "Cancel";
const buttonSaveAndContinue = "Save and Continue";
const mockVersionId = 3;
const mockRouteSubmit = `/reports/${mockVersionId}/attachment`;
const mandatoryFormFields = [
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
    label: "Type of site visit",
    type: "radio",
    key: "visit_type",
  },
  {
    label: "Please indicate the site visited",
    type: "text",
    key: "other_facility_name",
  },
  {
    label: "Geographic coordinates",
    type: "text",
    key: "other_facility_coordinates",
  },
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
const verificationFormData = {
  verification_body_name: "Test",
  accredited_by: "SCC",
  scope_of_verification: "Supplementary Report",
  visit_name: "Other",
  visit_type: "Virtual",
  other_facility_name: "Other Facility",
  other_facility_coordinates: "Lat 41; Long 35",
  threats_to_independence: "No",
  verification_conclusion: "Modified",
};

// 🧪 Test suite
describe("VerificationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the form with correct fields", () => {
    render(
      <VerificationForm
        versionId={mockVersionId}
        verificationSchema={verificationSchema}
        verificationUiSchema={verificationUiSchema}
      />,
    );
    // Assert fields and buttons
    expectField([
      "Verification body name",
      "Accredited by",
      "Scope of verification",
      "Sites visited",
      "Verification conclusion",
    ]);
    expect(
      screen.getByText(/Were there any threats to independence noted/i),
    ).toBeVisible();
    expectButton(buttonCancel);
    expectButton(buttonSaveAndContinue);
  });
  it("does not allow form submission if there are validation errors", async () => {
    render(
      <VerificationForm
        versionId={mockVersionId}
        verificationSchema={verificationSchema}
        verificationUiSchema={verificationUiSchema}
      />,
    );

    const button = screen.getByRole("button", { name: buttonSaveAndContinue });

    // Attempt to submit without filling mandatory fields
    fireEvent.click(button);

    // Assert validation errors
    await waitFor(() =>
      expect(screen.queryAllByText(/Required field/i)).toHaveLength(6),
    );
  });
  it(
    "fills mandatory fields and submits successfully",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <VerificationForm
          versionId={mockVersionId}
          verificationSchema={verificationSchema}
          verificationUiSchema={verificationUiSchema}
        />,
      );
      // Complete the form
      await fillMandatoryFields(mandatoryFormFields, verificationFormData);
      // Submit the form
      const button = screen.getByRole("button", {
        name: buttonSaveAndContinue,
      });
      fireEvent.click(button);
      // Assertions
      await waitFor(() => {
        expect(screen.queryByText(/Required field/i)).not.toBeInTheDocument();
        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith(mockRouteSubmit);
      });
    },
  );
});
