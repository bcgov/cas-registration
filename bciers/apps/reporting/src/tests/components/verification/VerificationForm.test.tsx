import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";
import {
  sfoUiSchema,
  lfoUiSchema,
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

// Mock operationType
let mockOperationType = "SFO";
const getUiSchema = (operationType: string) =>
  operationType === "SFO" ? sfoUiSchema : lfoUiSchema;

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

// Test data for mandatory fields
const formDataSets = {
  SFO: {
    verification_body_name: "SFO Test",
    accredited_by: "SCC",
    scope_of_verification: "Primary Report",
    visit_name: "None",
    threats_to_independence: "No",
    verification_conclusion: "Positive",
  },
  LFO: {
    verification_body_name: "LFO Test",
    accredited_by: "SCC",
    scope_of_verification: "Detailed Report",
    visit_name: "Facility A",
    threats_to_independence: "No",
    verification_conclusion: "Modified",
  },
};

// ⛏️ Helper function to render the form
const renderVerificationForm = (operationType: string) => {
  const verificationSchema = getUiSchema(operationType);
  render(
    <VerificationForm
      version_id={config.mockVersionId}
      operationType={operationType}
      verificationSchema={verificationSchema}
      initialData={{}}
      taskListElements={[]}
    />,
  );
};

// 🧪 Test suite
describe("VerificationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with SFO UI schema fields", async () => {
    mockOperationType = "SFO"; // Set to SFO
    renderVerificationForm(mockOperationType);
    expectField(commonMandatoryFormFields.map((field) => field.label));
    expectButton(config.buttons.cancel);
    expectButton(config.buttons.saveAndContinue);
  });

  it("renders the form with LFO UI schema fields", () => {
    mockOperationType = "LFO"; // Set to LFO
    renderVerificationForm(mockOperationType);
    expectField(commonMandatoryFormFields.map((field) => field.label));
    expectButton(config.buttons.cancel);
    expectButton(config.buttons.saveAndContinue);
  });
});
