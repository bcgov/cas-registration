import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AttachmentsElement from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/review-credits-issuance-request/AttachmentsElement";
import { vi } from "vitest";

describe("The AttachmentsElement component", () => {
  const mockOnRemoveFile = vi.fn();
  const mockOnAddFiles = vi.fn();
  const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a message when no files are uploaded", () => {
    render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[]}
      />,
    );

    expect(screen.getByText("No attachments were uploaded")).toBeVisible();
  });

  it("displays uploaded files with remove buttons", () => {
    render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[testFile]}
      />,
    );

    // Verify file is shown
    expect(screen.getByText("test.pdf")).toBeVisible();
    // Verify remove button is present
    expect(
      screen.getByRole("button", { name: /remove test.pdf/i }),
    ).toBeVisible();
  });

  it("allows removing an uploaded file", async () => {
    render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[testFile]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /remove test.pdf/i }),
    );
    expect(mockOnRemoveFile).toHaveBeenCalledWith(0);
  });

  it("allows uploading files", () => {
    const { container } = render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[]}
      />,
    );

    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [testFile] } });
    expect(mockOnAddFiles).toHaveBeenCalledWith([testFile]);
  });

  it("shows loading state during file upload", () => {
    render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[]}
        isUploading={true}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeVisible();
  });

  it("displays error message when upload fails", () => {
    const errorMessage = "File upload failed";
    render(
      <AttachmentsElement
        title="Attachments"
        onRemoveFile={mockOnRemoveFile}
        onAddFiles={mockOnAddFiles}
        uploadedFiles={[]}
        error={errorMessage}
      />,
    );

    expect(screen.getByText(errorMessage)).toBeVisible();
  });
});
