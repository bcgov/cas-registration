import { render, screen } from "@testing-library/react";
import { actionHandler } from "@bciers/actions";
import { MockedFunction } from "vitest";
import SubmittedAttachmentsSection from "@reporting/src/app/components/submitted/SubmittedAttachmentsSection";
import { ATTACHMENT_TYPE_LABELS } from "@reporting/src/app/components/attachments/constants";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockActionHandler = actionHandler as MockedFunction<typeof actionHandler>;

describe("SubmittedAttachmentsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActionHandler.mockResolvedValue("https://example.com/file.pdf");
  });

  it("renders the Attachments heading", () => {
    render(<SubmittedAttachmentsSection attachments={[]} version_id={1} />);
    expect(screen.getByText("Attachments")).toBeVisible();
  });

  it("renders a row for every attachment type", () => {
    render(<SubmittedAttachmentsSection attachments={[]} version_id={1} />);
    for (const label of Object.values(ATTACHMENT_TYPE_LABELS)) {
      expect(screen.getByText(label)).toBeVisible();
    }
  });

  it("shows 'No attachment was uploaded.' for each type when no attachments are provided", () => {
    render(<SubmittedAttachmentsSection attachments={[]} version_id={1} />);
    const messages = screen.getAllByText("No attachment was uploaded.");
    expect(messages).toHaveLength(Object.keys(ATTACHMENT_TYPE_LABELS).length);
  });

  it("renders a download button for an attachment that exists", () => {
    const attachments = [
      {
        id: 42,
        attachment_type: "verification_statement",
        attachment_name: "verification.pdf",
      },
    ];
    render(
      <SubmittedAttachmentsSection attachments={attachments} version_id={1} />,
    );
    expect(
      screen.getByRole("button", { name: "verification.pdf" }),
    ).toBeVisible();
  });

  it("calls the download endpoint when a file link is clicked", async () => {
    const attachments = [
      { id: 7, attachment_type: "wci_352_362", attachment_name: "wci.pdf" },
    ];
    render(
      <SubmittedAttachmentsSection attachments={attachments} version_id={5} />,
    );

    screen.getByRole("button", { name: "wci.pdf" }).click();

    expect(mockActionHandler).toHaveBeenCalledWith(
      "reporting/report-version/5/attachments/7",
      "GET",
      "",
    );
  });
});
