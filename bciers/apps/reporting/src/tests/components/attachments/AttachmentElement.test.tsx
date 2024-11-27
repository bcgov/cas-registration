import AttachmentElement from "@reporting/src/app/components/attachments/AttachmentElement";
import { render, screen } from "@testing-library/react";

describe("The AttachmentElement component", () => {
  it("Displays the title, a link and a message when no file info is passed in", () => {
    render(<AttachmentElement title="Test Title" onFileChange={vi.fn()} />);
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

  it("Shows a `will upload on save` when a file name but no file id is passed in", () => {
    render(
      <AttachmentElement
        title="Test Title"
        onFileChange={vi.fn()}
        fileName="test file name"
      />,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reupload attachment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "test file name" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/will upload on save/g)).toBeVisible();
  });
});
