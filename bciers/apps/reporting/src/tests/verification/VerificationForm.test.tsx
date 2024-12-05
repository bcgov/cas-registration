import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import {
  verificationSchema,
  verificationUiSchema,
} from "@reporting/src/data/verification/verification";
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
];

const specificMandatoryFields = {
  facility: [{ label: "Type of site visit", type: "radio", key: "visit_type" }],
  conditional: [
    { label: "Type of site visit", type: "radio", key: "visit_type" },
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
  ],
};

const formDataSets = {
  default: {
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "Supplementary Report",
    visit_name: "None",
  },
  facility: {
    verification_body_name: "Test",
    accredited_by: "SCC",
    scope_of_verification: "Supplementary Report",
    visit_name: "Facility A",
    visit_type: "Virtual",
  },
  conditional: {
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

// 🛠 Helpers
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

const submitFormAndAssert = async (
  fields: { label: string; type: string; key: string }[],
  data: Record<string, string | number>,
) => {
  await fillMandatoryFields(fields, data);
  const button = screen.getByRole("button", {
    name: config.buttons.saveAndContinue,
  });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.queryByText(/Required field/i)).not.toBeInTheDocument();
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
      expect(screen.queryAllByText(/Required field/i)).toHaveLength(4);
    });
  });

  it(
    "fills mandatory fields and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      renderVerificationForm();
      await submitFormAndAssert(
        commonMandatoryFormFields,
        formDataSets.default,
      );
    },
  );

  it(
    "fills facility mandatory fields and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      (verificationSchema.properties?.visit_name as any).enum = [
        ...(verificationSchema.properties?.visit_name as any).enum,
        "Facility A",
      ];

      renderVerificationForm();
      const fields = [
        ...commonMandatoryFormFields,
        ...specificMandatoryFields.facility,
      ];
      await submitFormAndAssert(fields, formDataSets.facility);
    },
  );

  it(
    "fills other conditionally mandatory fields and submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      renderVerificationForm();
      const fields = [
        ...commonMandatoryFormFields,
        ...specificMandatoryFields.conditional,
      ];
      await submitFormAndAssert(fields, formDataSets.conditional);
    },
  );
});
