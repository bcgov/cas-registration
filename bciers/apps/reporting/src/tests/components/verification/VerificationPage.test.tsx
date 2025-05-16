import { render } from "@testing-library/react";
import VerificationPage from "@reporting/src/app/components/verification/VerificationPage";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { OperationTypes } from "@bciers/utils/src/enums";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../taskList/utils";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

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

vi.mock("@reporting/src/app/utils/getReportVerificationStatus", () => ({
  getReportVerificationStatus: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportingOperation", () => ({
  getReportingOperation: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getIsSupplementaryReport", () => ({
  getIsSupplementaryReport: vi.fn(),
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
const mockGetReportVerificationStatus =
  getReportVerificationStatus as ReturnType<typeof vi.fn>;
const mockGetReportingOperation = getReportingOperation as ReturnType<
  typeof vi.fn
>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;
const mockGetIsSupplementaryReport = getIsSupplementaryReport as ReturnType<
  typeof vi.fn
>;

vi.mock("@reporting/src/app/components/taskList/reportingFlows", () => ({
  reportingFlows: {
    TestFlow: {
      TestHeader: ["TestPage", "TestPage2", "TestPage3"],
    },
  },
  getFlow: vi.fn().mockReturnValue("TestFlow" as ReportingFlow),
}));
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
    mockGetReportVerificationStatus.mockResolvedValue(true);
    mockGetReportingOperation.mockResolvedValue(mockReportOperation);
    mockGetIsSupplementaryReport.mockResolvedValue(false);
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);

    render(await VerificationPage({ version_id: mockVersionId }));

    expect(mockGetReportingOperation).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportVerification).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportFacilityList).toHaveBeenCalledWith(mockVersionId);
    expect(mockCreateVerificationSchema).toHaveBeenCalledWith(
      mockFacilityList.facilities,
      OperationTypes.SFO,
      false,
      false,
    );

    expect(mockVerificationForm).toHaveBeenCalledWith(
      {
        version_id: mockVersionId,
        operationType: OperationTypes.SFO,
        verificationSchema: mockVerificationSchema,
        initialData: mockInitialData,
        navigationInformation: dummyNavigationInformation,
        isSupplementaryReport: await mockGetIsSupplementaryReport(),
      },
      {},
    );
  });
});
