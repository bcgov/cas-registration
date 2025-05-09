import { render } from "@testing-library/react";
import AttachmentsForm from "@reporting/src/app/components/attachments/AttachmentsForm";
import AttachmentsPage from "@reporting/src/app/components/attachments/AttachmentsPage";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

vi.mock("@reporting/src/app/components/attachments/AttachmentsForm", () => ({
  default: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getAttachments", () => ({
  default: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportNeedsVerification", () => ({
  getReportNeedsVerification: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getIsSupplementaryReport", () => ({
  getIsSupplementaryReport: vi.fn(),
}));
vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockAttachmentsForm = AttachmentsForm as unknown as ReturnType<
  typeof vi.fn
>;
const mockGetAttachments = getAttachments as unknown as ReturnType<
  typeof vi.fn
>;
const mockGetReportNeedsVerification =
  getReportNeedsVerification as unknown as ReturnType<typeof vi.fn>;
const mockGetIsSupplementaryReport =
  getIsSupplementaryReport as unknown as ReturnType<typeof vi.fn>;
const mockGetNavigationInformation =
  getNavigationInformation as unknown as ReturnType<typeof vi.fn>;

describe("AttachmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls <AttachmentsForm> with the fetched data", async () => {
    const attachment1 = {
      id: 89771,
      attachment_type: "sometype",
      attachment_name: "somename",
    };
    const attachment2 = {
      id: 9,
      attachment_type: "othertype",
      attachment_name: "file.txt",
    };

    mockGetAttachments.mockResolvedValue({
      attachments: [attachment1, attachment2],
      confirmation: {
        confirm_supplementary_required_attachments_uploaded: false,
        confirm_supplementary_existing_attachments_relevant: true,
      },
    });
    mockGetReportNeedsVerification.mockResolvedValue(true);
    mockGetIsSupplementaryReport.mockResolvedValue(false);
    mockGetNavigationInformation.mockResolvedValue("navinfo");

    // await the async page component…
    const Page = await AttachmentsPage({ version_id: 12345 });
    render(Page);

    expect(mockAttachmentsForm).toHaveBeenCalledWith(
      {
        version_id: 12345,
        initialUploadedAttachments: {
          sometype: attachment1,
          othertype: attachment2,
        },
        navigationInformation: "navinfo",
        isVerificationStatementMandatory: true,
        isSupplementaryReport: false,
        initialSupplementaryConfirmation: {
          confirm_supplementary_required_attachments_uploaded: false,
          confirm_supplementary_existing_attachments_relevant: true,
        },
      },
      {},
    );
  });
});
