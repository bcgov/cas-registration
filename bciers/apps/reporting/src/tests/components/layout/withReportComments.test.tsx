import { render, screen } from "@testing-library/react";
import { getToken } from "@bciers/actions";
import withReportComments from "@reporting/src/app/components/layout/withReportComments";
import * as ReportCommentsModule from "@reporting/src/app/components/comments/ReportComments";
import { getCommentThreads } from "@reporting/src/app/utils/comments/getCommentThreads";
import { InternalFrontEndRoles } from "@bciers/utils/src/enums";

vi.mock("@reporting/src/app/utils/comments/getCommentThreads", () => ({
  getCommentThreads: vi.fn(),
}));
vi.mock("@reporting/src/app/components/comments/ReportComments", () => ({
  default: vi.fn(),
}));

const { default: ReportComments } = await vi.importActual<
  typeof ReportCommentsModule
>("@reporting/src/app/components/comments/ReportComments");
const PageWithComments = withReportComments(
  ({ version_id }: { version_id: number }) => (
    <main>Report page {version_id}</main>
  ),
);

describe("withReportComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getToken).mockResolvedValue({
      app_role: InternalFrontEndRoles.CAS_ANALYST,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the page and comments when loading succeeds", async () => {
    vi.mocked(getCommentThreads).mockResolvedValue({
      threads: [],
      facilities: [],
      can_create_comment_thread: true,
    });
    const comments = await ReportComments({ version_id: 42 });
    vi.mocked(ReportCommentsModule.default).mockReturnValue(comments);

    render(<PageWithComments version_id={42} />);

    expect(screen.getByText("Report page 42")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Comments" })).toBeVisible();
    expect(getCommentThreads).toHaveBeenCalledWith(42);
  });

  it("renders the page even when loading comments fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getCommentThreads).mockRejectedValue(
      new Error("Comments API unavailable"),
    );
    const comments = await ReportComments({ version_id: 42 });
    vi.mocked(ReportCommentsModule.default).mockReturnValue(comments);

    render(<PageWithComments version_id={42} />);

    expect(screen.getByText("Report page 42")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Comments could not be loaded.",
    );
    expect(
      screen.queryByRole("heading", { name: "Comments" }),
    ).not.toBeInTheDocument();
  });
});
