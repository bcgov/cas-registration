import { Grid, IconButton, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { UUID } from "crypto";
import { compareGuids } from "@reporting/src/app/utils/compareGuids";

interface Props {
  comment: Comment;
  userId: UUID;
  handleDelete: (commentId: number) => void;
}

const CommentComponent: React.FC<Props> = ({
  comment,
  userId,
  handleDelete,
}) => {
  const isCommentByCurrentUser = compareGuids(comment.user_id, userId);
  return (
    <Paper sx={{ p: 2, m: 1 }}>
      <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
          {comment.author}
        </Typography>
        <Grid sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {comment.timestamp &&
              formatDate(
                new Date(comment.timestamp).toLocaleString("en-US", {
                  timeZone: "America/Vancouver",
                }),
                "MMM D, YYYY h:mm A",
              )}
          </Typography>
          {isCommentByCurrentUser && (
            <>
              <IconButton
                aria-label="Delete comment"
                size="small"
                onClick={() => handleDelete(comment.id)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
