import { Button, Grid, Typography } from "@mui/material";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";

interface Props {
  thread: Thread;
  canReply: boolean;
  onThreadUpdated: (thread: Thread) => void;
}

const ThreadComponent: React.FC<Props> = ({
  thread,
  canReply,
  onThreadUpdated,
}) => {
  const handleResolveThread = (resolved: boolean) => {
    // Hit API

    onThreadUpdated({ ...thread, resolved });
  };

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
        />
      ))}
      <Grid className="mt-2">
        {canReply && !thread.resolved && (
          <Button variant="outlined" color="primary" fullWidth>
            Reply
          </Button>
        )}
      </Grid>
    </ThreadFrame>
  );
};

export default ThreadComponent;
