import AttachmentElement from "@reporting/src/app/components/attachments/AttachmentElement";
import AttachmentsForm from "@reporting/src/app/components/attachments/AttachmentsForm";
import postAttachments from "@reporting/src/app/utils/postAttachments";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { dummyNavigationInformation } from "../taskList/utils";

vi.mock("@reporting/src/app/components/attachments/AttachmentElement", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/postAttachments", () => ({
  default: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
  }),
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
        navigationInformation={dummyNavigationInformation}
        version_id={1}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={false}
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
        navigationInformation={dummyNavigationInformation}
        version_id={1}
        initialUploadedAttachments={attachmentData}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={false}
      />,
    );

    expect(mockAttachmentElement).toHaveBeenNthCalledWith(
      1,
      {
        fileId: 1,
        fileName: "test_name",
        onFileChange: expect.any(Function),
        title: "Verification Statement",
        required: true,
        error: undefined,
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

  it("submits the page if the verification statement doesn't have to be submitted", async () => {
    mockPostAttachments.mockReturnValue({});

    render(
      <AttachmentsForm
        navigationInformation={dummyNavigationInformation}
        version_id={1346}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={false}
        isSupplementaryReport={false}
      />,
    );

    await act(() => {
      fireEvent.click(screen.getByText("Save & Continue"));
    });

    expect(mockPostAttachments).not.toHaveBeenCalled();
  });

  it("submits the changed files along with their type", async () => {
    mockPostAttachments.mockReturnValue({});

    render(
      <AttachmentsForm
        navigationInformation={dummyNavigationInformation}
        version_id={1346}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={false}
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
      fireEvent.click(screen.getByText("Save & Continue"));
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

    expect(useRouter().push).toHaveBeenCalledWith("continue");
  });

  it("disables the submit button when verification statement is mandatory and no file is uploaded", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={false}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");
    expect(submitButton).toBeDisabled();
  });

  it("enables the submit button when verification statement is not mandatory and no file is uploaded", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={false}
        isSupplementaryReport={false}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");
    expect(submitButton).not.toBeDisabled();
  });

  it("enables the submit button when verification statement is not mandatory and file is uploaded", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{
          verification_statement: {
            id: 1,
            attachment_name: "test.pdf",
            attachment_type: "verification_statement",
          },
        }}
        isVerificationStatementMandatory={false}
        isSupplementaryReport={false}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");
    expect(submitButton).not.toBeDisabled();
  });

  it("disables the submit button when supplementary report is true and confirmations are not checked", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={false}
        isSupplementaryReport={true}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");
    expect(submitButton).toBeDisabled();
  });

  it("enables the submit button when supplementary report is true and confirmations are checked", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{}}
        isVerificationStatementMandatory={false}
        isSupplementaryReport={true}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");

    const confirmUploadedCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that I have uploaded any attachments that are required/i,
    });

    // Initially, the checkbox should be unchecked
    expect(confirmUploadedCheckbox).not.toBeChecked();

    // Click the checkbox
    fireEvent.click(confirmUploadedCheckbox);

    expect(submitButton).toBeDisabled();
    //  expect(submitButton).not.toBeDisabled();

    const confirmRelevantCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that any previously uploaded attachments/i,
    });

    // Initially, the checkbox should be unchecked
    expect(confirmRelevantCheckbox).not.toBeChecked();

    // Click the checkbox
    fireEvent.click(confirmRelevantCheckbox);

    expect(submitButton).not.toBeDisabled();
  });
  it("disables the submit button when verification statement is mandatory and file is uploaded but supplementary report confirmations are not checked", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{
          verification_statement: {
            id: 1,
            attachment_name: "test.pdf",
            attachment_type: "verification_statement",
          },
        }}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={true}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");

    const confirmUploadedCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that I have uploaded any attachments that are required/i,
    });
    fireEvent.click(confirmUploadedCheckbox);

    expect(submitButton).toBeDisabled();
  });
  it("enables the submit button when all conditions for supplementary report are met", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{
          verification_statement: {
            id: 1,
            attachment_name: "test.pdf",
            attachment_type: "verification_statement",
          },
        }}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={true}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");

    const confirmUploadedCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that I have uploaded any attachments that are required/i,
    });
    fireEvent.click(confirmUploadedCheckbox);

    const confirmRelevantCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that any previously uploaded attachments/i,
    });
    fireEvent.click(confirmRelevantCheckbox);

    expect(submitButton).not.toBeDisabled();
  });
  it("disables the submit button when verification statement is mandatory and file is uploaded but supplementary report confirmations are not checked", () => {
    render(
      <AttachmentsForm
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        initialUploadedAttachments={{
          verification_statement: {
            id: 1,
            attachment_name: "test.pdf",
            attachment_type: "verification_statement",
          },
        }}
        isVerificationStatementMandatory={true}
        isSupplementaryReport={true}
      />,
    );

    const submitButton = screen.getByText("Save & Continue");

    const confirmUploadedCheckbox = screen.getByRole("checkbox", {
      name: /i confirm that I have uploaded any attachments that are required/i,
    });
    fireEvent.click(confirmUploadedCheckbox);

    expect(submitButton).toBeDisabled();
  });
});
