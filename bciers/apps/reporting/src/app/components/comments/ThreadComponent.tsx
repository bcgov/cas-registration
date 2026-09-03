import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Comment } from "./types";
import CommentComponent from "./CommentComponent";
import ThreadFrame from "./ThreadFrame";

interface Props {
  version_id: number;
  facility_name?: string;
  facility_names: string[];
  comments: Comment[];
}

const ThreadComponent: React.FC<Props> = ({
  version_id,
  facility_name,
  facility_names,
  comments,
}) => {
  return (
    <ThreadFrame version_id={version_id}>
      {facility_name && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Facility Name:&nbsp;&nbsp;{facility_name}
        </Typography>
      )}
      {comments.map((comment) => (
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
