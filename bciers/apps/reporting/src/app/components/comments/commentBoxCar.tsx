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
import { Comment, Thread } from "./types";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentSeat from "./commentSeat";
import { addCommentToThread } from "../../utils/addComment";
import { useRouter } from "next/navigation";

interface Props {
  thread: Thread;
  version_id: number;
  onCommentAdded?: (threadId: number, comment: Comment) => void;
}

const CommentBoxCar: React.FC<Props> = ({
  thread,
  version_id,
  onCommentAdded,
}) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [areCommentsCollapsed, setAreCommentsCollapsed] = useState(false);

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
      }}
    >
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
                {formattedCreatedAt} by {thread.user_name ?? "unkown"}
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
        {thread.report_comments.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
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
          {thread.report_comments.map((comment, index) => (
            <CommentSeat
              key={comment.id ?? `${thread.id}-${index}`}
              comment={comment}
              isLast={index === thread.report_comments.length - 1}
            />
          ))}
        </Collapse>
      </Box>

      {/* reply */}
      <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
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
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
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
      </Collapse>
    </Paper>
  );
};

export default CommentBoxCar;
