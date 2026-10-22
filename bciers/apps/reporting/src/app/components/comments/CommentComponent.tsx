import { Grid, Paper, Typography } from "@mui/material";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
}

const CommentComponent: React.FC<Props> = ({ comment }) => {
  return (
    <Paper sx={{ p: 2, m: 1 }}>
      <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" className="font-bold">
          {comment.author}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {comment.timestamp &&
            formatDate(
              new Date(comment.timestamp).toLocaleString("en-US", {
                timeZone: "America/Vancouver",
              }),
              "MMM D, YYYY h:mm A",
            )}
        </Typography>
      </Grid>
      <Typography variant="body2" className="mt-2">
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
