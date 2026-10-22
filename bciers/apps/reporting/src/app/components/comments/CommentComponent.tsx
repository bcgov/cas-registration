import { Paper, Typography } from "@mui/material";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
}

const CommentComponent: React.FC<Props> = ({ comment }) => {
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
      </div>
      <Typography variant="body2" className="mt-2">
        {comment.comment}
      </Typography>
    </Paper>
  );
};

export default CommentComponent;
