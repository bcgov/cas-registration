import postLlmChat from "@reporting/src/app/utils/postLlmChat";

describe("postLlmChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue("LLM response"),
    } as unknown as Response);
  });

  it("posts the prompt to the reporting llm-chat endpoint", async () => {
    await postLlmChat(
      "Need review & summary",
      "/tmp/verification-statement.pdf",
    );

    expect(fetch).toHaveBeenCalledWith("/reporting/api/llm-chat", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Need review & summary",
        attachment_path: "/tmp/verification-statement.pdf",
      }),
    });
  });
});
