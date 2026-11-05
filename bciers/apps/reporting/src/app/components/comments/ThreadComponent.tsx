import { Button, Grid, TextField, Typography } from "@mui/material";
import { useTransition, useState } from "react";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";
import { actionHandler } from "@bciers/actions";
import { postComment } from "../../utils/comments/postComment";
import {
  handleApiResponse,
  useValidationErrors,
} from "@bciers/components/validationErrors";
import { deleteComment } from "../../utils/comments/deleteComment";

interface Props {
  thread: Thread;
  version_id: number;
  canUpdate: boolean;
  onThreadUpdated: (thread: Thread) => void;
  onThreadDeleted: (threadId: number) => void;
}

const ThreadComponent: React.FC<Props> = ({
  thread,
  version_id,
  canUpdate,
  onThreadUpdated,
  onThreadDeleted,
}) => {
  const [_, startTransition] = useTransition();
  const { setErrors, renderedErrors } = useValidationErrors();
  const [replyMessage, setReplyMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleResolveThread = (resolved: boolean) => {
    startTransition(async () => {
      // Hit API to resolve thread
      const response = await actionHandler(
        `reporting/v2/report-version/${thread.version_id}/threads/${thread.id}/resolve`,
        "PATCH",
        `reports/${thread.version_id}/`,
        {
          body: JSON.stringify({ resolved }),
        },
      );
      if (handleApiResponse(response, setErrors)) {
        onThreadUpdated({ ...thread, resolved });
      }
    });
  };
  const handleCommentDelete = (reportVersionId: number, commentId: number) => {
    startTransition(async () => {
      const resp = await deleteComment(reportVersionId, thread.id, commentId);
      if (handleApiResponse(resp, setErrors)) {
        if (resp === null) {
          onThreadDeleted(thread.id);
        } else {
          onThreadUpdated(resp as Thread);
        }
      }
    });
  };
  const handleCommentPost = (
    reportVersionId: number,
    threadId: number,
    message: string,
  ) => {
    setIsUpdating(true);
    startTransition(async () => {
      const resp = await postComment(reportVersionId, threadId, message);
      if (handleApiResponse(resp, setErrors)) {
        onThreadUpdated(resp as Thread);
        setReplyMessage("");
      }
      setIsUpdating(false);
    });
  };

  return (
    <ThreadFrame
      version_id={thread.version_id}
      resolved={thread.resolved}
      onResolveClicked={handleResolveThread}
    >
      {renderedErrors}
      {thread.facility_name && (
        <Typography
          variant="body2"
          className="mt-2 group-[.resolved]:text-bc-component-grey"
        >
          Facility Name:<span className="ml-2">{thread.facility_name}</span>
        </Typography>
      )}
      {thread.comments.map((comment) => (
        <CommentComponent
          key={comment.id ?? "comment-pending-submission"}
          comment={comment}
          handleDelete={handleCommentDelete}
          canUpdate={canUpdate}
        />
      ))}
      <Grid className="mt-2">
        {canUpdate && !thread.resolved && (
          <>
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() =>
                handleCommentPost(version_id, thread.id, replyMessage)
              }
              fullWidth
              disabled={!replyMessage || isUpdating}
            >
              Reply
            </Button>
          </>
        )}
      </Grid>
    </ThreadFrame>
  );
};

export default ThreadComponent;
