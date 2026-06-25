"use client";

import {
  Box,
  Button,
  Drawer,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CommentBoxCar from "./commentBoxCar";
import { Comment, Thread } from "./types";
import { createCommentThread } from "../../utils/createThread";
import { TrainStations } from "@bciers/utils/src/enums";
import { useRouter } from "next/navigation";

interface Props {
  threads: Thread[];
  version_id: number;
  facility_id?: string;
}

const CommentPacificRailway: React.FC<Props> = ({
  threads,
  version_id,
  facility_id,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadSection, setNewThreadSection] = useState<TrainStations | "">(
    "",
  );
  const [localThreads, setLocalThreads] = useState<Thread[]>(threads);

  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const createNewCommentThread = async () => {
    const trimmedTitle = newThreadTitle.trim();
    if (!trimmedTitle) return;

    const createdThread = await createCommentThread(
      trimmedTitle,
      version_id,
      facility_id,
      newThreadSection || undefined,
    );
    if (createdThread?.id) {
      setLocalThreads((previousThreads) => [createdThread, ...previousThreads]);
    }
    setNewThreadTitle("");
    router.refresh();
  };

  const handleCommentAdded = (threadId: number, comment: Comment) => {
    setLocalThreads((previousThreads) =>
      previousThreads.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        return {
          ...thread,
          report_comments: [...thread.report_comments, comment],
        };
      }),
    );
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
        <Box
          sx={{
            width: { xs: "100vw", sm: 460 },
            maxWidth: "100vw",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
            Comments
          </Typography>
          <Stack spacing={2} sx={{ px: 2, pb: 2, flexShrink: 0 }}>
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
                setNewThreadSection(event.target.value as TrainStations | "")
              }
            >
              <MenuItem value="">(Optional) Report Section</MenuItem>
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
          <Box
            sx={{
              px: 2,
              pb: 2,
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              "& > *": { flex: "0 0 auto" },
            }}
          >
            {localThreads.map((thread) => (
              <CommentBoxCar
                key={thread.id}
                thread={thread}
                version_id={version_id}
                onCommentAdded={handleCommentAdded}
              />
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default CommentPacificRailway;
