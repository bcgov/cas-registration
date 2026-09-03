import { Box, Chip, Paper, Typography } from "@mui/material";
import Comment from "./Comment";

interface Props {
  version_id: number;
  facility_name: string;
}

const Thread: React.FC<Props> = ({ version_id, facility_name }) => {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box>
        <Chip label="Internal Comment" size="small" color="primary" />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Report Version ID:&nbsp;&nbsp;{version_id}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Facility Name:&nbsp;&nbsp;{facility_name}
        </Typography>
        <Comment
          comment="This is a sample comment"
          author="John D."
          timestamp="2024-06-01 10:00"
        />
        <Comment
          comment="Thank you."
          author="Adam C."
          timestamp="2024-06-01 11:00"
        />
      </Box>
    </Paper>
  );
};

export default Thread;
