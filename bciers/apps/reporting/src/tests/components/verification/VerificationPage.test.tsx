import { render } from "@testing-library/react";
import VerificationPage from "@reporting/src/app/components/verification/VerificationPage";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { OperationTypes } from "@bciers/utils/src/enums";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../taskList/utils";

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
  getReportNeedsVerification: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportingOperation", () => ({
  getReportingOperation: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
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
const mockGetReportNeedsVerification = getReportNeedsVerification as ReturnType<
  typeof vi.fn
>;
const mockGetReportingOperation = getReportingOperation as ReturnType<
  typeof vi.fn
>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
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
    const mockReportOperation = {
      operation_type: OperationTypes.SFO,
    };

    mockGetReportVerification.mockResolvedValue(mockInitialData);
    mockGetReportFacilityList.mockResolvedValue(mockFacilityList);
    mockCreateVerificationSchema.mockReturnValue(mockVerificationSchema);
    mockGetReportNeedsVerification.mockResolvedValue(true);
    mockGetReportingOperation.mockResolvedValue(mockReportOperation);
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);

    render(await VerificationPage({ version_id: mockVersionId }));

    expect(mockGetReportingOperation).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportVerification).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportFacilityList).toHaveBeenCalledWith(mockVersionId);
    expect(mockCreateVerificationSchema).toHaveBeenCalledWith(
      mockFacilityList.facilities,
      OperationTypes.SFO,
    );

    expect(mockVerificationForm).toHaveBeenCalledWith(
      {
        version_id: mockVersionId,
        operationType: OperationTypes.SFO,
        verificationSchema: mockVerificationSchema,
        initialData: mockInitialData,
        navigationInformation: dummyNavigationInformation,
      },
      {},
    );
  });
});
