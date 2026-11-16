import {
  Button,
  Collapse,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTransition, useState } from "react";
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
  const [isReplying, setIsReplying] = useState(false);
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

  const handleClickReply = () => {
    setIsReplying(true);
  };

  const handleCommentPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = new FormData(event.currentTarget)
      .get("comment")
      ?.toString()
      .trim();
    if (!message) {
      // If the comment message is empty, set the empty comment error and return
      setErrors([EMPTY_COMMENT_ERROR]);
      return;
    }

    setErrors([]);
    setIsUpdating(true);
    startTransition(async () => {
      const resp = await postComment(version_id, thread.id, message);
      if (handleApiResponse(resp, setErrors)) {
        onThreadUpdated(resp as Thread);
        setIsReplying(false);
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
          canUpdate={canUpdate}
        />
      ))}
      {renderedErrors}
      <Grid className="mt-4">
        {canUpdate && !thread.resolved && (
          <>
            <Collapse in={!isReplying} timeout={400} unmountOnExit>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClickReply}
                fullWidth
                disabled={isUpdating}
              >
                Reply
              </Button>
            </Collapse>
            <Collapse in={isReplying} timeout={400} unmountOnExit>
              <form onSubmit={handleCommentPost}>
                <TextField
                  fullWidth
                  name="comment"
                  label="Comment"
                  multiline
                  rows={3}
                  error={hasCommentError}
                  disabled={isUpdating}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isUpdating}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsReplying(false)}
                    fullWidth
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </Stack>
              </form>
            </Collapse>
          </>
        )}
      </Grid>
    </ThreadFrame>
  );
};

export default ThreadComponent;
