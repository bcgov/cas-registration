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

  const threadUpdated = (update: Thread) => {
    setCommentThreads((prevThreads) =>
      prevThreads.map((thread) => (thread.id === update.id ? update : thread)),
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
      {commentThreads
        .filter((thread) => !thread.resolved)
        .map((thread) => (
          <ThreadComponent
            key={`thread-${thread.id}`}
            thread={thread}
            canReply={canMakeComment}
            onThreadUpdated={threadUpdated}
          />
        ))}
      <Typography className="p-4 pb-0" color="primary">
        Resolved Comments
      </Typography>
      {commentThreads
        .filter((thread) => thread.resolved)
        .map((thread) => (
          <ThreadComponent
            key={`thread-${thread.id}`}
            thread={{ ...thread, resolved: true }}
            canReply={false}
            onThreadUpdated={threadUpdated}
          />
        ))}
    </Paper>
  );
};

export default CommentsSidebar;
