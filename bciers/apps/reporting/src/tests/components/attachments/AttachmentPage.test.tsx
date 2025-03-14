import AttachmentsForm from "@reporting/src/app/components/attachments/AttachmentsForm";
import AttachmentsPage from "@reporting/src/app/components/attachments/AttachmentsPage";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { render } from "@testing-library/react";

vi.mock("@reporting/src/app/components/attachments/AttachmentsForm", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getAttachments", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportNeedsVerification", () => ({
  getReportNeedsVerification: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/5_signOffSubmit", () => ({
  getSignOffAndSubmitSteps: vi.fn().mockReturnValue("test task list"),
  ActivePage: {
    Attachments: "Attachments",
  },
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockAttachmentsForm = AttachmentsForm as ReturnType<typeof vi.fn>;
const mockGetAttachments = getAttachments as ReturnType<typeof vi.fn>;
const mockGetReportNeedsVerification = getReportNeedsVerification as ReturnType<
  typeof vi.fn
>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;

describe("The attachment page component", () => {
  it("must render the client side component with the fetched data", async () => {
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

    mockGetAttachments.mockReturnValue([attachment1, attachment2]);
    mockGetReportNeedsVerification.mockResolvedValue(true);
    mockGetNavigationInformation.mockReturnValue("navinfo");

    render(
      await AttachmentsPage({
        version_id: 12345,
      }),
    );

    expect(mockAttachmentsForm).toHaveBeenCalledWith(
      {
        initialUploadedAttachments: {
          sometype: attachment1,
          othertype: attachment2,
        },
        navigationInformation: "navinfo",
        version_id: 12345,
        isVerificationStatementMandatory: true,
      },
      {},
    );
  });
});
