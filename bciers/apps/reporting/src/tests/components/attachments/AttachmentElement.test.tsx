import { actionHandler } from "@bciers/actions";
import AttachmentElement from "@reporting/src/app/components/attachments/AttachmentElement";
import { act, render, screen } from "@testing-library/react";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;

describe("The AttachmentElement component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActionHandler.mockResolvedValue(true); // Mock successful action handler
  });

  it("Displays the title, a link and a message when no file info is passed in", () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        versionId={12399}
      />,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload attachment" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No attachment was uploaded")).toBeInTheDocument();
  });

  it("Displays the file information when file info is passed in", () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        fileName="test file name"
        fileId={1234}
        versionId={12399}
      />,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reupload attachment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "test file name" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("will upload on save")).not.toBeInTheDocument();
  });

  it("Calls the get file url endpoint when the file link is clicked", async () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        fileName="test file name"
        fileId={1234}
        versionId={12399}
      />,
    );

    const fileLink = screen.getByRole("link", { name: "test file name" });

    await act(() => {
      fileLink.click();
    });

    expect(mockActionHandler).toHaveBeenCalledWith(
      "reporting/report-version/12399/attachments/1234",
      "GET",
      "",
    );
  });

  it("Shows a `will upload on save` when a file name but no file id is passed in", () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        fileName="test file name"
        versionId={12399}
      />,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reupload attachment" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "test file name" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("test file name")).toBeInTheDocument();
    expect(screen.getByText(/will upload on save/g)).toBeVisible();
  });

  it("Renders an error if passed", () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        fileName="test file name"
        error="This is an error"
        versionId={12399}
      />,
    );
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });
});
