import { Suspense } from "react";
import { Box, Grid } from "@mui/material";
import ReportComments from "../comments/ReportComments";

export default function withReportComments<
  TPageProps extends { version_id: number },
>(WrappedPage: React.FC<TPageProps>) {
  const WrappedComponent: React.FC<TPageProps> = (props) => (
    <Grid container spacing={2}>
      <Grid size={8}>
        <WrappedPage {...props} />
      </Grid>

      <Grid size={4}>
        <Box className="sticky top-0 max-h-screen overflow-y-auto">
          <Suspense fallback={<output>Loading comments...</output>}>
            <ReportComments version_id={props.version_id} />
          </Suspense>
        </Box>
      </Grid>
    </Grid>
  );

  return WrappedComponent;
}
