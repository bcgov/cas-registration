"use client";

import { Button, Drawer } from "@mui/material";
import React, { useState } from "react";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CommentBoxCar from "./commentBoxCar";
import { Thread } from "./types";
import { createCommentThread } from "../../utils/createThread";

interface Props {
  threads: Thread[];
  version_id: number;
}

const CommentPacificRailway: React.FC<Props> = ({ threads, version_id }) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  console.log(threads);

  const createNewCommentThread = () => {
    createCommentThread(version_id, "New Thread");
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
        <Button
          onClick={createNewCommentThread}
          variant="outlined"
          color="primary"
          fullWidth
        >
          __________-----------New Thread-----------__________
        </Button>
        {threads.map((thread) => (
          <CommentBoxCar key={thread.created_by} thread={thread} />
        ))}
      </Drawer>
    </>
  );
};

export default CommentPacificRailway;
