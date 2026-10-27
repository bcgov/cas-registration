import { IconButton, Paper, Typography } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
  handleDelete: (commentId: number) => void;
}

const CommentComponent: React.FC<Props> = ({ comment, handleDelete }) => {
  return (
    <Paper className="p-4 mt-2">
      <div className="flex justify-between">
        <Typography
          variant="caption"
          className="font-bold group-[.resolved]:text-bc-component-grey"
        >
          {comment.author}
        </Typography>
        <Typography
          variant="caption"
          className="text-black/60 group-[.resolved]:text-bc-component-grey"
        >
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
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </>
        )}
      </div>
      <Typography
        variant="body2"
        className="mt-2 group-[.resolved]:text-bc-component-grey"
      >
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
