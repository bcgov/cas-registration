import { IconButton, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
  handleDelete: (commentId: number) => void;
}

const CommentComponent: React.FC<Props> = ({ comment, handleDelete }) => {
  return (
    <Paper className="p-4 m-2">
      <div className="flex justify-between">
        <Typography variant="caption" className="font-bold">
          {comment.author}
        </Typography>
        <Typography variant="caption" className="text-black/60">
          {comment.timestamp &&
            formatDate(
              new Date(comment.timestamp).toLocaleString("en-US", {
                timeZone: "America/Vancouver",
              }),
              "MMM D, YYYY h:mm A",
            )}
        </Typography>
        {comment.user_can_edit && (
          <>
            <IconButton
              title="Delete comment"
              aria-label="Delete comment"
              size="small"
              onClick={() => handleDelete(comment.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </div>
      <Typography variant="body2" className="mt-2">
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
