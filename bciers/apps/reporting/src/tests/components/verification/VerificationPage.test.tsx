import { render } from "@testing-library/react";
import VerificationPage from "@reporting/src/app/components/verification/VerificationPage";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import { getSignOffAndSubmitSteps } from "@reporting/src/app/components/taskList/5_signOffSubmit";

vi.mock("@reporting/src/app/components/verification/VerificationForm", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportVerification", () => ({
  getReportVerification: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportFacilityList", () => ({
  getReportFacilityList: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/verification/createVerificationSchema",
  () => ({
    createVerificationSchema: vi.fn(),
  }),
);

vi.mock("@reporting/src/app/utils/getReportNeedsVerification", () => ({
  getReportNeedsVerification: vi.fn(() => Promise.resolve(true)), // Mocking to return true
}));

vi.mock("@reporting/src/app/components/taskList/5_signOffSubmit", () => ({
  getSignOffAndSubmitSteps: vi.fn(),
  ActivePage: {
    Verification: "Verification",
  },
}));

const mockVerificationForm = VerificationForm as ReturnType<typeof vi.fn>;
const mockGetReportVerification = getReportVerification as ReturnType<
  typeof vi.fn
>;
const mockGetReportFacilityList = getReportFacilityList as ReturnType<
  typeof vi.fn
>;
const mockCreateVerificationSchema = createVerificationSchema as ReturnType<
  typeof vi.fn
>;
const mockGetSignOffAndSubmitSteps = getSignOffAndSubmitSteps as ReturnType<
  typeof vi.fn
>;

describe("VerificationPage component", () => {
  it("renders the VerificationForm component with the correct data", async () => {
    const mockVersionId = 12345;
    const mockInitialData = { field1: "value1", field2: "value2" };
    const mockFacilityList = {
      facilities: [
        { id: 1, name: "Facility 1" },
        { id: 2, name: "Facility 2" },
      ],
    };
    const mockVerificationSchema = { type: "object", properties: {} };
    const mockTaskListElements = [
      { type: "Page", title: "Verification", isActive: true },
    ];

    mockGetReportVerification.mockResolvedValue(mockInitialData);
    mockGetReportFacilityList.mockResolvedValue(mockFacilityList);
    mockCreateVerificationSchema.mockReturnValue(mockVerificationSchema);
    mockGetSignOffAndSubmitSteps.mockResolvedValue(mockTaskListElements);

    render(await VerificationPage({ version_id: mockVersionId }));

    expect(mockGetReportVerification).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportFacilityList).toHaveBeenCalledWith(mockVersionId);
    // expect(mockCreateVerificationSchema).toHaveBeenCalledWith(
    //   mockFacilityList.facilities,
    // );
    expect(mockGetSignOffAndSubmitSteps).toHaveBeenCalledWith(
      mockVersionId,
      "Verification",
      true,
    );

    // expect(mockVerificationForm).toHaveBeenCalledWith(
    //   {
    //     version_id: mockVersionId,
    //     verificationSchema: mockVerificationSchema,
    //     verificationUiSchema: expect.any(Object),
    //     initialData: mockInitialData,
    //     taskListElements: mockTaskListElements,
    //   },
    //   {},
    // );
  });
});
