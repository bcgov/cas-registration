import { Button, Grid, TextField, Typography } from "@mui/material";
import { useTransition, useState, useRef } from "react";
import { Thread, EMPTY_COMMENT_ERROR } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";
import { actionHandler } from "@bciers/actions";
import { postComment } from "../../utils/comments/postComment";
import {
  handleApiResponse,
  useValidationErrors,
} from "@bciers/components/validationErrors";
import { deleteComment } from "../../utils/comments/deleteComment";
import { patchComment } from "../../utils/comments/patchComment";

interface Props {
  thread: Thread;
  version_id: number; //this report version ID comes from the page and is independant of the thread's report version ID
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
  const { errors, setErrors, renderedErrors } = useValidationErrors();
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
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

  const handleCommentEdit = async (
    reportVersionId: number,
    commentId: number,
    content: string,
  ): Promise<boolean> => {
    const resp = await patchComment(
      reportVersionId,
      thread.id,
      commentId,
      content,
    );
    if (handleApiResponse(resp, setErrors)) {
      onThreadUpdated(resp as Thread);
      return true;
    }
    return false;
  };
  const handleCommentPost = (reportVersionId: number, threadId: number) => {
    const message = replyInputRef.current?.value.trim();
    if (!message) {
      // If the comment message is empty, set the empty comment error and return
      setErrors([EMPTY_COMMENT_ERROR]);
      return;
    }

    setErrors([]);
    setIsUpdating(true);
    startTransition(async () => {
      const resp = await postComment(reportVersionId, threadId, message);
      if (handleApiResponse(resp, setErrors)) {
        onThreadUpdated(resp as Thread);
        if (replyInputRef.current) replyInputRef.current.value = "";
      }
      setIsUpdating(false);
    });
  };

  const hasCommentError: boolean =
    errors?.some(({ error }) => error.severity === "Error") ?? false;

  return (
    <ThreadFrame
      version_id={thread.version_id}
      resolved={thread.resolved}
      onResolveClicked={handleResolveThread}
    >
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
          handleEdit={handleCommentEdit}
          canUpdate={canUpdate}
        />
      ))}
      {renderedErrors}
      <Grid className="mt-2">
        {canUpdate && !thread.resolved && (
          <>
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              inputRef={replyInputRef}
              error={hasCommentError}
              disabled={isUpdating}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleCommentPost(version_id, thread.id)}
              fullWidth
              disabled={isUpdating}
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
