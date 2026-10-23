import { Box, Chip, Link, Paper, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

interface Props {
  version_id: number;
  resolved?: boolean;
  onResolveClicked?: (resolved: boolean) => void;
}

const ThreadFrame: React.FC<PropsWithChildren<Props>> = ({
  version_id,
  resolved,
  onResolveClicked,
  children,
}) => {
  return (
    <Paper
      className={`p-4 m-4 mb-0 group ${resolved ? "resolved" : ""}`}
      elevation={0}
    >
      <Box>
        <div className="flex justify-between">
          <Chip
            label="Internal Comment"
            size="small"
            color={resolved ? "secondary" : "primary"}
          />
          {resolved !== undefined && (
            <Link
              component="button"
              variant="body2"
              onClick={() => onResolveClicked && onResolveClicked(!resolved)}
            >
              {resolved ? "Unresolve" : "Resolve"}
            </Link>
          )}
        </div>
        <Typography
          variant="body2"
          className="mt-2 group-[.resolved]:text-bc-component-grey"
        >
          Report Version ID:&nbsp;&nbsp;{version_id}
        </Typography>
        {children}
      </Box>
    </Paper>
  );
};

export default ThreadFrame;
