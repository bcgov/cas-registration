"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Thread, FacilityItem } from "./types";
import ThreadComponent from "./ThreadComponent";
import NewThreadComponent from "./NewThreadComponent";
import { useState } from "react";
import { InternalFrontEndRoles } from "@bciers/utils/src/enums";

interface Props {
  version_id: number;
  threads: Thread[];
  facilities: FacilityItem[];
  userRole: InternalFrontEndRoles;
}

const ROLES_CAN_COMMENT = new Set([
  InternalFrontEndRoles.CAS_DIRECTOR,
  InternalFrontEndRoles.CAS_ANALYST,
]);

const CommentsSidebar: React.FC<Props> = ({
  version_id,
  threads,
  facilities,
  userRole,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [commentThreads, setCommentThreads] = useState(threads);
  const canCreate = ROLES_CAN_COMMENT.has(userRole);

  const handleCreate = (newThread: Thread) => {
    setCommentThreads((prevThreads) => [newThread, ...prevThreads]);
    setIsCreating(false);
  };

  return (
    <Paper
      sx={{
        height: "100%",
        background: "#f5f5f5",
        "@media print": { display: "none" },
      }}
    >
      <Box className="p-4 pb-8 bg-bc-white">
        <Typography variant="h6" className="p-4 pl-0">
          Comments
        </Typography>
        {canCreate && (
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
      {canCreate && isCreating && (
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
          canReply={canCreate}
        />
      ))}
    </Paper>
  );
};

export default CommentsSidebar;
