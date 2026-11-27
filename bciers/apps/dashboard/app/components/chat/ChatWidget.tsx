"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  Fab,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ChatMarkdown from "./ChatMarkdown";

/*
📌 Dev-only docs chat (see apps/dashboard/app/api/chat/route.ts).
Rendered by the dashboard layout only when isChatEnabled() is true.
*/

export const CHAT_ENDPOINT = "/api/chat";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  model?: string;
  // Error replies are shown but never sent back to the model.
  isError?: boolean;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight });
  }, [messages]);

  const updateLast = (update: Partial<ChatMessage>, append = "") =>
    setMessages((current) => {
      const last = current[current.length - 1];
      return [
        ...current.slice(0, -1),
        { ...last, ...update, content: last.content + append },
      ];
    });

  const send = async () => {
    const question = input.trim();
    if (!question || pending) return;

    const history = [...messages, { role: "user" as const, content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((message) => !message.isError && message.content)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        updateLast({ isError: true }, await res.text());
        return;
      }

      updateLast({ model: res.headers.get("X-Chat-Model") || undefined });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        updateLast({}, decoder.decode(value, { stream: true }));
      }
    } catch {
      updateLast(
        { isError: true },
        "The chat service is unavailable right now.",
      );
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  if (!open) {
    return (
      <Fab
        color="primary"
        aria-label="Open BCIERS Chat"
        onClick={() => setOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
      >
        <ChatIcon />
      </Fab>
    );
  }

  return (
    <Paper
      role="dialog"
      aria-labelledby={titleId}
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1200,
        width: { xs: "calc(100vw - 48px)", sm: 520 },
        height: { xs: "75vh", sm: 640 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box className="flex justify-between items-center px-4 py-2 border-b border-[lightgrey]">
        <h2 id={titleId} className="text-lg m-0">
          BCIERS Chat
        </h2>
        <IconButton
          aria-label="Close BCIERS Chat"
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Local only. Answers are based on the developer docs and codebase and may
        be wrong. Don&apos;t paste sensitive data.
      </Alert>

      <Box
        ref={listRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
      >
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Ask a question about the application, for example &quot;Provide a
            detailed explanation of penalties and interest&quot; or
            &quot;Provide a concise explanation of penalties and interest&quot;
          </Typography>
        )}
        {messages.map((message, index) => {
          const isAnswer = message.role === "assistant" && !message.isError;
          const waiting =
            pending && index === messages.length - 1 && !message.content;
          return (
            <Box
              key={index}
              data-testid={`chat-message-${message.role}`}
              className={`rounded p-3 text-sm ${
                message.role === "user"
                  ? "self-end bg-[#e8f0fa] whitespace-pre-wrap"
                  : "self-start bg-[#f5f5f5]"
              }`}
              sx={{
                maxWidth: isAnswer ? "100%" : "90%",
                color: message.isError ? "error.main" : undefined,
              }}
            >
              {waiting && "…"}
              {isAnswer && message.content ? (
                <ChatMarkdown content={message.content} />
              ) : (
                message.content
              )}
              {message.model && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                  sx={{ mt: 1 }}
                >
                  {message.model}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 border-t border-[lightgrey]"
      >
        <TextField
          inputRef={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the app…"
          slotProps={{ htmlInput: { "aria-label": "Chat message" } }}
          multiline
          maxRows={4}
          size="small"
          fullWidth
        />
        <Box className="flex flex-col gap-1">
          <Button
            type="submit"
            variant="contained"
            disabled={pending || !input.trim()}
          >
            Send
          </Button>
          <Button
            size="small"
            onClick={() => setMessages([])}
            disabled={pending || messages.length === 0}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
