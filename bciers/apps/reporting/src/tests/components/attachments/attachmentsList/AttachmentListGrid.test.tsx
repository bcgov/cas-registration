import AttachmentsListGrid from "@reporting/src/app/components/attachments/attachmentsList/AttachmentsListGrid";
import getAttachmentFileUrl from "@reporting/src/app/utils/getAttachmentFileUrl";
import { act, render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { URLSearchParams } from "url";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getAttachmentFileUrl", () => ({
  default: vi.fn(),
}));

const mockUseSearchParams = useSearchParams as unknown as ReturnType<
  typeof vi.fn
>;

const mockGetAttachmentFileUrl = getAttachmentFileUrl as unknown as ReturnType<
  typeof vi.fn
>;

describe("The AttachmentsListGrid component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("Displays all the columns", () => {
    const props = {
      initialData: {
        rows: [],
        row_count: 0,
      },
    };

    render(<AttachmentsListGrid {...props} />);

    for (const column of [
      "Operator",
      "Operation",
      "Version ID",
      "Type",
      "Download",
    ]) {
      expect(
        screen.getByRole("columnheader", { name: column }),
      ).toBeInTheDocument();
    }

    // 5 for the headers and 5 for the search cells
    expect(screen.queryAllByRole("columnheader")).toHaveLength(10);
  });

  it("Displays one row per attachment returned by the server", async () => {
    const props = {
      initialData: {
        rows: [
          {
            id: 1,
            operator: "Operator 1",
            operation: "Operaion 1",
            report_version_id: 123,
            attachment_type: "verification_statement",
            attachment_name: "somefile.pdf",
          },
          {
            id: 2,
            operator: "Operator 2",
            operation: "Operation 2",
            report_version_id: 456,
            attachment_type: "wci_352_362",
            attachment_name: "somefile2.docx",
          },
        ],
        row_count: 2,
      },
    };

    render(<AttachmentsListGrid {...props} />);

    expect(screen.queryAllByRole("row")).toHaveLength(4); // 2 rows + 2 header rows
    expect(
      screen.getByRole("gridcell", { name: "Operator 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("gridcell", { name: "Operator 2" }),
    ).toBeInTheDocument();
  });

  it("Displays a download link that calls the api on click", async () => {
    const props = {
      initialData: {
        rows: [
          {
            id: 1,
            operator: "Operator 1",
            operation: "Operaion 1",
            report_version_id: 123,
            attachment_type: "verification_statement",
            attachment_name: "somefile.pdf",
          },
        ],
        row_count: 2,
      },
    };

    render(<AttachmentsListGrid {...props} />);

    await act(() => {
      screen.getByText("somefile.pdf").click();
    });

    expect(mockGetAttachmentFileUrl).toHaveBeenCalledWith(123, 1);
  });
});
