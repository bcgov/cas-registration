import { actionHandler } from "@bciers/actions";
import ReadOnlyAttachmentElement from "@reporting/src/app/components/attachments/ReadOnlyAttachmentElement";
import { act, render, screen } from "@testing-library/react";
import { MockedFunction } from "vitest";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockActionHandler = actionHandler as MockedFunction<typeof actionHandler>;

describe("The ReadOnlyAttachmentElement component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActionHandler.mockResolvedValue("https://example.com/file.pdf");
  });

  it("displays the title and 'No attachment was uploaded.' when no file is provided", () => {
    render(<ReadOnlyAttachmentElement title="Test Title" versionId={1} />);
    expect(screen.getByText("Test Title")).toBeVisible();
    expect(screen.getByText("No attachment was uploaded.")).toBeVisible();
  });

  it("does not render an upload button", () => {
    render(<ReadOnlyAttachmentElement title="Test Title" versionId={1} />);
    expect(
      screen.queryByRole("button", { name: /upload attachment/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a download button when a file is present", () => {
    render(
      <ReadOnlyAttachmentElement
        title="Test Title"
        versionId={1}
        fileName="report.pdf"
        fileId={99}
      />,
    );
    expect(screen.getByRole("button", { name: "report.pdf" })).toBeVisible();
  });

  it("calls the download endpoint when the file button is clicked", async () => {
    render(
      <ReadOnlyAttachmentElement
        title="Test Title"
        versionId={12399}
        fileName="test file name"
        fileId={1234}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "test file name" }).click();
    });

    expect(mockActionHandler).toHaveBeenCalledWith(
      "reporting/report-version/12399/attachments/1234",
      "GET",
      "",
    );
  });
});
