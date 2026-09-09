"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Thread, FacilityItem } from "./types";
import ThreadComponent from "./ThreadComponent";
import NewThreadComponent from "./NewThreadComponent";
import { useState } from "react";
import postCommentThread from "../../utils/postCommentThread";

interface Props {
  version_id: number;
  threads: Thread[];
  facilities: FacilityItem[];
}

const CommentsSidebar: React.FC<Props> = ({
  version_id,
  threads,
  facilities,
}) => {
  const facilitiesList = facilities.map(
    (facility) => facility.facility_name || "Unknown Facility",
  );

  const [isCreating, setIsCreating] = useState(false);
  const [commentThreads, setCommentThreads] = useState(threads);

  const handleCreate = async (comment: string, facilityId?: string) => {
    const newThread = await postCommentThread(version_id, comment, facilityId);

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
          facilities={facilitiesList}
          onCancel={() => {
            setIsCreating(false);
          }}
          onThreadCreated={handleCreate}
          version_id={version_id}
        />
      )}
      {commentThreads.map((thread) => (
        <ThreadComponent key={`thread-${thread.id}`} thread={thread} />
      ))}
    </Paper>
  );
};

export default CommentsSidebar;
