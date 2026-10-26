import { Button, Grid, Typography } from "@mui/material";
import { useState, useTransition } from "react";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";

interface Props {
  thread: Thread;
  canReply: boolean;
  onCommentDeleted: (threadId: number, commentId: number) => void;
}

const ThreadComponent: React.FC<Props> = ({ thread, canReply, onCommentDeleted }) => {
  const [errors, setErrors] = useState<{ field: string; error: string }[]>([]);
  const [, startTransition] = useTransition();

  const handleCommentDelete = (commentId: number) => {
    startTransition(async () => {
      const resp = await deleteComment(commentId);
      if (resp.error) {
        setErrors([{ field: "comment", error: resp.error }]);
        return;
      }
      setErrors([]);
      onCommentDeleted(thread.id, commentId);
    });
  };
  return (
    <ThreadFrame version_id={thread.version_id}>
      {thread.facility_name && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Facility Name:<span className="ml-2">{thread.facility_name}</span>
        </Typography>
      )}
      {thread.comments.map((comment) => (
        <CommentComponent
          key={comment.id ?? "comment-pending-submission"}
          comment={comment}
          handleDelete={handleCommentDelete}
        />
      ))}
      <Grid sx={{ m: 1 }}>
        {canReply && (
          <Button variant="outlined" color="primary" fullWidth>
            Reply
          </Button>
        )}
      </Grid>
    </ThreadFrame>
  );
};

export default ThreadComponent;
