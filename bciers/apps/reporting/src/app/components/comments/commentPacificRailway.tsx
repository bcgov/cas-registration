"use client";

import { Button, Drawer, MenuItem, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CommentBoxCar from "./commentBoxCar";
import { Thread } from "./types";
import { createCommentThread } from "../../utils/createThread";
import { TrainStations } from "@bciers/utils/src/enums";

interface Props {
  threads: Thread[];
  version_id: number;
}

const CommentPacificRailway: React.FC<Props> = ({ threads, version_id }) => {
  const [open, setOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadSection, setNewThreadSection] = useState(
    TrainStations.REVIEW_OPERATION_INFORMATION,
  );

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const createNewCommentThread = async () => {
    const trimmedTitle = newThreadTitle.trim();
    if (!trimmedTitle) return;

    await createCommentThread(version_id, trimmedTitle, newThreadSection);
    setNewThreadTitle("");
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{ position: "fixed", right: 0, top: "25%", height: "4rem" }}
        onClick={toggleDrawer(true)}
      >
        <QuestionAnswerIcon />
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        <h1 className={`w-full text-lg`} style={{ textAlign: "center" }}>
          Comments
        </h1>
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Thread title"
            value={newThreadTitle}
            onChange={(event) => setNewThreadTitle(event.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Report section"
            value={newThreadSection}
            onChange={(event) =>
              setNewThreadSection(event.target.value as TrainStations)
            }
          >
            {Object.values(TrainStations).map((section) => (
              <MenuItem key={section} value={section}>
                {section}
              </MenuItem>
            ))}
          </TextField>
          <Button
            onClick={createNewCommentThread}
            variant="outlined"
            color="primary"
            fullWidth
            disabled={!newThreadTitle.trim()}
          >
            Create Thread
          </Button>
        </Stack>
        {threads.map((thread) => (
          <CommentBoxCar key={thread.created_by} thread={thread} />
        ))}
      </Drawer>
    </>
  );
};

export default CommentPacificRailway;
