import { Grid, Paper, Typography } from "@mui/material";
import { Comment } from "./types";

interface Props {
  comment: Comment;
}

const CommentComponent: React.FC<Props> = ({ comment }) => {
  return (
    <Paper sx={{ p: 2, m: 1 }}>
      <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
          {comment.author}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {comment.timestamp}
        </Typography>
      </Grid>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
