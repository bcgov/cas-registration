import { Box, Button, Paper, Typography } from "@mui/material";
import Thread from "./Thread";

interface Props {
  version_id: number;
}

const CommentsSidebar: React.FC<Props> = ({ version_id }) => {
  return (
    <Paper
      sx={{
        height: "100%",
        background: "#f5f5f5",
        "@media print": { display: "none" },
      }}
    >
      <Box
        sx={{
          p: 2,
          pb: 4,
          background: "#ffffff",
        }}
      >
        <Typography variant="h6" sx={{ p: 2, pl: 0 }}>
          Comments for report version {version_id}
        </Typography>
        <Button variant="contained" color="primary" fullWidth>
          Add internal Comment
        </Button>
      </Box>
      <Thread
        version_id={version_id}
        facility_name="Dining & Cutlery Pad 15-30-19W7182"
      />
    </Paper>
  );
};

export default CommentsSidebar;
