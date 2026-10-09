"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Thread, FacilityItem } from "./types";
import ThreadComponent from "./ThreadComponent";
import NewThreadComponent from "./NewThreadComponent";
import { useState } from "react";
import { UUID } from "crypto";

interface Props {
  version_id: number;
  threads: Thread[];
  facilities: FacilityItem[];
  userId: UUID;
}

const CommentsSidebar: React.FC<Props> = ({
  version_id,
  threads,
  facilities,
  userId,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [commentThreads, setCommentThreads] = useState(threads);

  const handleCreate = async (newThread: Thread) => {
    setCommentThreads((prevThreads) => [newThread, ...prevThreads]);
    setIsCreating(false);
  };

  const handleCommentDeleted = (threadId: number, commentId: number) => {
    setCommentThreads((prevThreads) =>
      prevThreads.flatMap((thread) => {
        if (thread.id !== threadId) return [thread];
        const comments = thread.comments.filter(
          (comment) => comment.id !== commentId,
        );
        return comments.length > 0 ? [{ ...thread, comments }] : [];
      }),
    );
  };

  return (
    <Paper
      sx={{
        height: "100%",
        background: "#f5f5f5",
        "@media print": { display: "none" },
      }}
    >
      <Box
        sx={{
          p: 2,
          pb: 4,
          background: "#ffffff",
        }}
      >
        <Typography variant="h6" sx={{ p: 2, pl: 0 }}>
          Comments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setIsCreating(true)}
        >
          Add internal Comment
        </Button>
      </Box>
      {isCreating && (
        <NewThreadComponent
          facilities={facilities}
          onCancel={() => {
            setIsCreating(false);
          }}
          onThreadCreated={handleCreate}
          version_id={version_id}
        />
      )}
      {commentThreads.map((thread) => (
        <ThreadComponent
          key={`thread-${thread.id}`}
          thread={thread}
          userId={userId}
          onCommentDeleted={handleCommentDeleted}
        />
      ))}
    </Paper>
  );
};

export default CommentsSidebar;
