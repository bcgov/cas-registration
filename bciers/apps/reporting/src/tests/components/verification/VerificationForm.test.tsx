import { render, screen } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import {
  sfoUiSchema,
  lfoUiSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import expectButton from "@bciers/testConfig/helpers/expectButton";
import expectField from "@bciers/testConfig/helpers/expectField";
import { OperationTypes } from "@bciers/utils/src/enums";

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
    revalidatePath: "reporting/reports/current-reports",
  },
  mockVersionId: 3,
  mockRouteSubmit: `/reports/3/attachments?`,
};

// Mock operationType
let mockOperationType = OperationTypes.SFO;
const getUiSchema = (operationType: string) => {
  const schema =
    operationType === OperationTypes.SFO ? sfoUiSchema : lfoUiSchema;
  if (operationType === OperationTypes.EIO) {
    schema.properties = schema.properties || {};
    schema.properties.info_note = { type: "object", readOnly: true };
    schema.required = [];
  }
  return schema;
};

// 🏷 Common Fields
const commonMandatoryFormFields = [
  {
    label: "Verification body name",
    type: "text",
    key: "verification_body_name",
  },
  // { label: "Accredited by", type: "combobox", key: "accredited_by" },
  // {
  //   label: "Scope of verification",
  //   type: "combobox",
  //   key: "scope_of_verification",
  // },
  // { label: "Sites visited", type: "combobox", key: "visit_name" },
  // {
  //   label: "Were there any threats to independence noted",
  //   type: "radio",
  //   key: "threats_to_independence",
  // },
  // {
  //   label: "Verification conclusion",
  //   type: "combobox",
  //   key: "verification_conclusion",
  // },
];

// ⛏️ Helper function to render the form
const renderVerificationForm = (operationType: string) => {
  const verificationSchema = getUiSchema(operationType);
  render(
    <VerificationForm
      version_id={config.mockVersionId}
      operationType={operationType}
      verificationSchema={verificationSchema}
      initialData={{}}
      navigationInformation={
        {
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        } as any
      }
      isSupplementaryReport={false}
      isEIO={operationType === OperationTypes.EIO}
    />,
  );
};

// 🧪 Test suite
describe("VerificationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
  });

  it("renders the form with SFO UI schema fields", async () => {
    mockOperationType = OperationTypes.SFO; // Set to SFO
    renderVerificationForm(mockOperationType);
    expectField(commonMandatoryFormFields.map((field) => field.label));
    expectButton(config.buttons.cancel);
    expectButton(config.buttons.saveAndContinue);
  });

  it("renders the form with LFO UI schema fields", () => {
    mockOperationType = OperationTypes.LFO; // Set to LFO
    renderVerificationForm(mockOperationType);
    expectField(commonMandatoryFormFields.map((field) => field.label));
    expectButton(config.buttons.cancel);
    expectButton(config.buttons.saveAndContinue);
  });

  it("renders the form with EIO description text", () => {
    mockOperationType = OperationTypes.EIO; // Set to EIO
    renderVerificationForm(mockOperationType);
    expect(
      screen.getByText(
        "The following fields are only required if your emissions were over 25kt.",
      ),
    ).toBeVisible();
  });
});
