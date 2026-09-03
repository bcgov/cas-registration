import { Grid, Paper, Typography } from "@mui/material";

interface Props {
  comment: string;
  author: string;
  timestamp: string;
}

const Comment: React.FC<Props> = ({ comment, author, timestamp }) => {
  return (
    <Paper sx={{ p: 2, m: 1 }}>
      <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
          {author}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {timestamp}
        </Typography>
      </Grid>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment}
      </Typography>
    </Paper>
  );
};

export default Comment;
