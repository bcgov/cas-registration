import { Button, Grid, Typography } from "@mui/material";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";
import { useTransition } from "react";
import { actionHandler } from "@bciers/actions";
import {
  handleApiResponse,
  useValidationErrors,
} from "@bciers/components/validationErrors";

interface Props {
  thread: Thread;
  canUpdate: boolean;
  onThreadUpdated: (thread: Thread) => void;
}

const ThreadComponent: React.FC<Props> = ({
  thread,
  canUpdate,
  onThreadUpdated,
}) => {
  const [_, startTransition] = useTransition();
  const { setErrors, renderedErrors } = useValidationErrors();

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
          disabled={thread.resolved}
        />
      ))}
      <Grid className="mt-2">
        {canUpdate && !thread.resolved && (
          <Button variant="outlined" color="primary" fullWidth>
            Reply
          </Button>
        )}
      </Grid>
    </ThreadFrame>
  );
};

export default ThreadComponent;
