import { Button, Typography } from "@mui/material";
import { Thread } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";

interface Props {
  thread: Thread;
}

const ThreadComponent: React.FC<Props> = ({ thread }) => {
  return (
    <ThreadFrame version_id={thread.version_id}>
      {thread.facility_name && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Facility Name:&nbsp;&nbsp;{thread.facility_name}
        </Typography>
      )}
      {thread.comments.map((comment) => (
        <CommentComponent
          key={comment.id ?? "comment-pending-submission"}
          comment={comment}
        />
      ))}
      <Button sx={{ m: 1 }} variant="outlined" color="primary" fullWidth>
        Reply
      </Button>
    </ThreadFrame>
  );
};

export default ThreadComponent;
