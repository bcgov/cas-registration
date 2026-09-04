"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Thread } from "./types";
import ThreadComponent from "./ThreadComponent";
import NewThreadComponent from "./NewThreadComponent";
import { useState } from "react";

const getCommentThreads = (version_id: number): Thread[] => {
  // Will call the GET api

  return [
    {
      id: 1,
      version_id: version_id,
      facility_name: "Dining & Cutlery Pad 15-30-19W7182",
      comments: [
        {
          id: 1,
          version_id: 5,
          author: "John Doe",
          timestamp: "2024-06-01T12:00:00Z",
          comment: "The allocation of emissions is incorrect",
        },
        {
          id: 2,
          version_id: 6,
          author: "Adam C.",
          timestamp: "2024-06-01T12:00:00Z",
          comment: "Thank you.",
        },
      ],
    },
    {
      id: 2,
      version_id: 7,
      comments: [
        {
          id: 3,
          version_id: 8,
          author: "Pierre B.",
          timestamp: "2024-06-01T12:00:00Z",
          comment: "This is just wrong!",
        },
      ],
    },
  ];
};

interface Props {
  version_id: number;
}

const CommentsSidebar: React.FC<Props> = ({ version_id }) => {
  const facilitiesList = ["Facility 1", "Facility 2", "Facility 3"];

  const [isCreating, setIsCreating] = useState(false);
  const [commentThreads, setCommentThreads] = useState(
    getCommentThreads(version_id),
  );

  const handleCreate = (thread: Thread) => {
    // Will call the create thread API

    setCommentThreads((prevThreads) => [thread, ...prevThreads]);
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
