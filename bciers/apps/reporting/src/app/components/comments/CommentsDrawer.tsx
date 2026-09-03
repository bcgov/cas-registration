import { Box, Button, Drawer, Typography } from "@mui/material";
import Comment from "./Comment";

interface Props {
  version_id: number;
}

const CommentsDrawer: React.FC<Props> = ({ version_id }) => {
  return (
    <Drawer open={true} anchor="right">
      <Box
        sx={{
          width: { xs: "100vw", sm: 460 },
          maxWidth: "100vw",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
          Comments for report version {version_id}
        </Typography>
        <Button variant="outlined" color="primary" fullWidth>
          Add internal Comment
        </Button>
      </Box>
      <Comment comment="This is a sample comment" />
      <Comment comment="This is another sample comment" />
    </Drawer>
  );
};

export default CommentsDrawer;
