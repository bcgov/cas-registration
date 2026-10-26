"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Thread, FacilityItem } from "./types";
import ThreadComponent from "./ThreadComponent";
import NewThreadComponent from "./NewThreadComponent";
import { useState } from "react";

interface Props {
  version_id: number;
  threads: Thread[];
  facilities: FacilityItem[];
  canMakeComment: boolean;
}

const CommentsSidebar: React.FC<Props> = ({
  version_id,
  threads,
  facilities,
  canMakeComment,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [commentThreads, setCommentThreads] = useState(threads);

  const handleCreate = (newThread: Thread) => {
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
    <Paper className="h-full bg-bc-light-grey-200 print:hidden">
      <Box className="p-4 pb-8 bg-bc-white">
        <Typography variant="h6" className="p-4 pl-0">
          Comments
        </Typography>
        {canMakeComment && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setIsCreating(true)}
          >
            Add internal Comment
          </Button>
        )}
      </Box>
      {canMakeComment && isCreating && (
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
          canReply={canMakeComment}
          onCommentDeleted={handleCommentDeleted}
        />
      ))}
    </Paper>
  );
};

export default CommentsSidebar;
