import { render, screen } from "@testing-library/react";
import ReportComments from "@reporting/src/app/components/comments/ReportComments";
import { getCommentThreads } from "@reporting/src/app/utils/getCommentThreads";

vi.mock("@reporting/src/app/utils/getCommentThreads", () => ({
  getCommentThreads: vi.fn(),
}));

const mockGetCommentThreads = getCommentThreads as ReturnType<typeof vi.fn>;

describe("The report comments component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders open and resolved threads from the API", async () => {
    mockGetCommentThreads.mockResolvedValue({
      can_create_comment_thread: true,
      facilities: [],
      threads: [
        {
          id: 1,
          version_id: 42,
          resolved: false,
          comments: [{ id: 1, version_id: 42, comment: "Open comment" }],
        },
        {
          id: 2,
          version_id: 42,
          resolved: true,
          comments: [{ id: 2, version_id: 42, comment: "Resolved comment" }],
        },
      ],
    });

    render(await ReportComments({ version_id: 42 }));

    expect(mockGetCommentThreads).toHaveBeenCalledWith(42);
    expect(screen.getByText("Open comment")).toBeVisible();
    expect(screen.getByText("Resolved comment")).toBeVisible();
    expect(screen.getByRole("button", { name: "Resolve" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Unresolve" })).toBeVisible();
  });

  it("shows an error alert when comments fail to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetCommentThreads.mockRejectedValue(new Error("no api"));

    render(await ReportComments({ version_id: 42 }));

    expect(screen.getByText("Comments could not be loaded.")).toBeVisible();
  });
});
