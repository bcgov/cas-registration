import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubmittedVerificationStatementSection from "@reporting/src/app/components/submitted/SubmittedVerificationStatementSection";
import postLlmChat from "@reporting/src/app/utils/postLlmChat";

vi.mock("@reporting/src/app/utils/postLlmChat", () => ({
  default: vi.fn(),
}));

const mockPostLlmChat = postLlmChat as ReturnType<typeof vi.fn>;
const verificationStatementFilePath =
  "/Users/awilliam/Documents/cas-registration/bc_obps/report_attachments_2026_BC-OBPS_Verification_Report__Statement_ISH_Energy_2025RY.pdf";

describe("SubmittedVerificationStatementSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders prompt input, submit button, and read-only response box", () => {
    render(
      <SubmittedVerificationStatementSection
        verificationStatementFilePath={verificationStatementFilePath}
      />,
    );

    expect(screen.getByText("Verification Statement")).toBeVisible();
    expect(screen.getByLabelText("Prompt")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit" })).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Download Verification Statement PDF",
      }),
    ).toBeVisible();
    expect(screen.getByLabelText("Attached file")).toHaveValue(
      verificationStatementFilePath,
    );
    expect(screen.getByLabelText("Response")).toBeVisible();
  });

  it("posts the prompt and renders the llm response", async () => {
    const user = userEvent.setup();
    mockPostLlmChat.mockResolvedValue("LLM output");

    render(
      <SubmittedVerificationStatementSection
        verificationStatementFilePath={verificationStatementFilePath}
      />,
    );

    await user.type(screen.getByLabelText("Prompt"), "Summarize this PDF");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockPostLlmChat).toHaveBeenCalledWith(
        "Summarize this PDF",
        verificationStatementFilePath,
      );
    });
    expect(screen.getByLabelText("Response")).toHaveValue("LLM output");
  });

  it("shows a validation error when the prompt is empty", async () => {
    const user = userEvent.setup();

    render(
      <SubmittedVerificationStatementSection
        verificationStatementFilePath={verificationStatementFilePath}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("Enter a prompt before submitting.")).toBeVisible();
    expect(mockPostLlmChat).not.toHaveBeenCalled();
  });

  it("shows endpoint errors in the section", async () => {
    const user = userEvent.setup();
    mockPostLlmChat.mockResolvedValue({ error: "LM Studio is offline" });

    render(
      <SubmittedVerificationStatementSection
        verificationStatementFilePath={verificationStatementFilePath}
      />,
    );

    await user.type(screen.getByLabelText("Prompt"), "Parse this");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(screen.getByText("LM Studio is offline")).toBeVisible();
    });
    expect(screen.getByLabelText("Response")).toHaveValue("");
  });
});
