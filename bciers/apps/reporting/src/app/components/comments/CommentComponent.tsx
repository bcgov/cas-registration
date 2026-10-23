import { Paper, Typography } from "@mui/material";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
}

const CommentComponent: React.FC<Props> = ({ comment }) => {
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
          className="text-black/60 group-[.resolved]:text-black/30"
        >
          {comment.timestamp &&
            formatDate(
              new Date(comment.timestamp).toLocaleString("en-US", {
                timeZone: "America/Vancouver",
              }),
              "MMM D, YYYY h:mm A",
            )}
        </Typography>
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
