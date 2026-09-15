import { Box, Chip, Paper, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

interface Props {
  version_id: number;
}

const ThreadFrame: React.FC<PropsWithChildren<Props>> = ({
  version_id,
  children,
}) => {
  return (
    <Paper sx={{ p: 2, m: 2, boxShadow: "none" }}>
      <Box>
        <Chip label="Internal Comment" size="small" color="primary" />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Report Version ID:&nbsp;&nbsp;{version_id}
        </Typography>
        {children}
      </Box>
    </Paper>
  );
};

export default ThreadFrame;
