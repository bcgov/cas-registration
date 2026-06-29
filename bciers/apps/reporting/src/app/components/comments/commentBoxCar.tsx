"use client";

import {
  Button,
  Box,
  Chip,
  Collapse,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Comment, Thread, TimelineEntry } from "./types";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentSeat from "./commentSeat";
import EventSeat from "./eventSeat";
import { addCommentToThread } from "../../utils/addComment";
import { useRouter } from "next/navigation";
import { checkTicket } from "../../utils/checkTicket";

interface Props {
  thread: Thread;
  version_id: number;
  onCommentAdded?: (threadId: number, comment: Comment) => void;
  isAuthoredByCurrentUser?: boolean;
}

const CommentBoxCar: React.FC<Props> = ({
  thread,
  version_id,
  onCommentAdded,
  isAuthoredByCurrentUser,
}) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [areCommentsCollapsed, setAreCommentsCollapsed] = useState(
    thread.is_resolved,
  );

  const handleSubmitComment = async () => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    const createdComment = await addCommentToThread(
      thread.id,
      trimmedComment,
      version_id,
    );

    if (createdComment?.id) {
      onCommentAdded?.(thread.id, createdComment);
    }

    setCommentText("");
    router.refresh();
  };

  const handleCheckTicket = async () => {
    await checkTicket(thread.id);
    router.refresh();
  };

  const createdAt = new Date(thread.created_at);
  const formattedCreatedAt = createdAt.toLocaleString("en-US", {
    timeZone: "America/Vancouver",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const timelineEntries: TimelineEntry[] = [
    ...(thread.report_comments ?? []).map((comment) => ({
      ...comment,
      entry_type: "comment" as const,
    })),
    ...(thread.report_events ?? []).map((event) => ({
      ...event,
      entry_type: "event" as const,
    })),
  ].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: "fit-content",
        flex: "0 0 auto",
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%)",
        opacity: thread.is_resolved ? 0.5 : 1,
        filter: thread.is_resolved ? "grayscale(100%)" : "none",
      }}
    >
      {thread.is_resolved && (
        <Typography
          variant="h4"
          sx={{
            position: "absolute",
            color: "rgba(0, 0, 0, 0.1)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-15deg)",
            fontWeight: "bold",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          resolved
        </Typography>
      )}
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                {thread.title ?? ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formattedCreatedAt}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                by {thread.user_name ?? "unknown"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction={"column"} spacing={1} alignItems="right">
            <Chip
              size="small"
              label={
                thread.report_version_id
                  ? `Report Version ID: ${thread.report_version_id}`
                  : ""
              }
              color="primary"
              variant="outlined"
            />
            {thread.facility_name && (
              <Chip
                size="small"
                label={`Facility: ${thread.facility_name}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>

        {thread.report_section && (
          <Chip
            size="small"
            label={thread.report_section}
            sx={{ mt: 1.5 }}
            variant="filled"
          />
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 1.5 }}>
        {timelineEntries.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1, filter: "none", opacity: 1 }}>
            <Button
              size="small"
              onClick={() => setAreCommentsCollapsed((prev) => !prev)}
            >
              {areCommentsCollapsed ? (
                <>
                  <ExpandMoreIcon fontSize="small" /> Expand
                </>
              ) : (
                <>
                  <ExpandLessIcon fontSize="small" /> Collapse
                </>
              )}
            </Button>
          </Stack>
        )}

        {/* comment list */}
        <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
          {timelineEntries.map((entry, index) => {
            const isLast = index === timelineEntries.length - 1;

            if (entry.entry_type === "event") {
              return (
                <EventSeat
                  key={entry.id ?? `${thread.id}-event-${index}`}
                  event={entry}
                  isLast={isLast}
                />
              );
            }

            return (
              <CommentSeat
                key={entry.id ?? `${thread.id}-comment-${index}`}
                comment={entry}
                isLast={isLast}
              />
            );
          })}
        </Collapse>
      </Box>

      {/* reply */}
      <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
        {!thread.is_resolved && (
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="flex-start"
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Add a comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                sx={{ minWidth: { xs: "100%", sm: 120 }, mt: { sm: 0.5 } }}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        )}
      </Collapse>

      {/* resolve button */}
      {!thread.is_resolved && isAuthoredByCurrentUser && (
        <Box sx={{ pb: 2.5, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleCheckTicket}
          >
            resolve thread
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CommentBoxCar;
