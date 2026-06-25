async function postLlmChat(prompt: string, attachmentPath?: string) {
  const response = await fetch("/reporting/api/llm-chat", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      attachment_path: attachmentPath,
    }),
  });

  if (!response.ok) {
    let message = `HTTP error! Status: ${response.status}`;
    try {
      const res = await response.json();
      if (res?.message) {
        message = res.message;
      }
    } catch {
      // Keep fallback error message when response body is not JSON.
    }

    return { error: message };
  }

  return response.json();
}

export default postLlmChat;
