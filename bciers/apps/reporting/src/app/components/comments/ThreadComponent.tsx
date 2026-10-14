import { Button, Grid, Typography } from "@mui/material";
import { useState, useTransition } from "react";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";
import { UUID } from "crypto";
import { deleteComment } from "../../utils/deleteComment";
import AlertNote from "@bciers/components/form/components/AlertNote";
interface Props {
  thread: Thread;
  canReply: boolean;
  userId: UUID;
  onCommentDeleted: (threadId: number, commentId: number) => void;
}

const ThreadComponent: React.FC<Props> = ({
  thread,
  canReply,
  userId,
  onCommentDeleted,
}) => {
  const [errors, setErrors] = useState<{ field: string; error: string }[]>([]);
  const [, startTransition] = useTransition();

  const handleCommentDelete = (commentId: number) => {
    startTransition(async () => {
      const resp = await deleteComment(commentId);
      if (resp !== 200) {
        setErrors([
          {
            field: "comment",
            error:
              typeof resp === "number"
                ? `HTTP error! Status: ${resp}`
                : resp.error,
          },
        ]);
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
          userId={userId}
          handleDelete={handleCommentDelete}
        />
      ))}
      {errors.length > 0 && (
        <AlertNote alertType="ERROR">
          {errors.map((error, index) => (
            <div key={index}>{error.error}</div>
          ))}
        </AlertNote>
      )}
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
