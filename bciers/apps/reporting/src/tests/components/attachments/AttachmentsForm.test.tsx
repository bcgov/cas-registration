import AttachmentElement from "@reporting/src/app/components/attachments/AttachmentElement";
import AttachmentsForm from "@reporting/src/app/components/attachments/AttachmentsForm";
import postAttachments from "@reporting/src/app/utils/postAttachments";

import { act, render, screen } from "@testing-library/react";

vi.mock("@reporting/src/app/components/attachments/AttachmentElement", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/postAttachments", () => ({
  default: vi.fn(),
}));

const mockAttachmentElement = AttachmentElement as ReturnType<typeof vi.fn>;
const mockPostAttachments = postAttachments as ReturnType<typeof vi.fn>;

describe("The attachments form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the appropriate text", () => {
    render(
      <AttachmentsForm
        taskListElements={[]}
        version_id={1}
        initialUploadedAttachments={{}}
      />,
    );

    expect(
      screen.getByText(
        "Please upload any of the documents below that is applicable to your report:",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Note:")).toBeInTheDocument();
  });
  it("renders an attachment element for each attachment type, and populates with initial data if it exists", () => {
    const attachmentData = {
      verification_statement: {
        id: 1,
        attachment_name: "test_name",
        attachment_type: "verification_statement",
      },
      test_type_2: {
        id: 2,
        attachment_name: "test_name",
        attachment_type: "test_type_2",
      },
    };

    render(
      <AttachmentsForm
        taskListElements={[]}
        version_id={1}
        initialUploadedAttachments={attachmentData}
      />,
    );

    expect(mockAttachmentElement).toHaveBeenNthCalledWith(
      1,
      {
        fileId: 1,
        fileName: "test_name",
        onFileChange: expect.any(Function),
        title: "Verification Statement",
      },
      {},
    );
    expect(mockAttachmentElement).toHaveBeenNthCalledWith(
      2,
      {
        fileId: undefined,
        fileName: undefined,
        onFileChange: expect.any(Function),
        title: "WCI.352 and WCI.362",
      },
      {},
    );
    expect(mockAttachmentElement).toHaveBeenNthCalledWith(
      3,
      {
        fileId: undefined,
        fileName: undefined,
        onFileChange: expect.any(Function),
        title: "Additional reportable information",
      },
      {},
    );
    expect(mockAttachmentElement).toHaveBeenNthCalledWith(
      4,
      {
        fileId: undefined,
        fileName: undefined,
        onFileChange: expect.any(Function),
        title:
          "Confidentiality request, if you are requesting confidentiality of this report under the B.C. Reg. 249/2015 Reporting Regulation",
      },
      {},
    );
  });

  it("submits the changed files along with their type", async () => {
    mockPostAttachments.mockReturnValue([]);

    render(
      <AttachmentsForm
        taskListElements={[]}
        version_id={1346}
        initialUploadedAttachments={{}}
      />,
    );

    const onChangeVerificationStatement =
      mockAttachmentElement.mock.calls[0][0].onFileChange;

    const file = new File(["jkzhshhfiu4hiouashbdfgiuhberufh"], "testFile.pdf", {
      type: "application/pdf",
    });

    await act(() => {
      onChangeVerificationStatement(file);
    });

    await act(() => {
      screen.getByText("Save and Continue").click();
    });

    expect(mockPostAttachments).toHaveBeenCalledOnce();

    const sentVersionId = mockPostAttachments.mock.calls[0][0];
    const sentFormDataKeys = Array.from(
      mockPostAttachments.mock.calls[0][1].keys(),
    );
    const sentFormDataValues = Array.from(
      mockPostAttachments.mock.calls[0][1].values(),
    );

    expect(sentVersionId).toEqual(1346);
    expect(sentFormDataKeys).toEqual(["files", "file_types"]);
    expect(sentFormDataValues).toEqual([file, "verification_statement"]);
  });
});
