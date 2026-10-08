import { Suspense } from "react";
import { Grid } from "@mui/material";
import ReportComments from "../comments/ReportComments";
import { getToken } from "@bciers/actions";

export default function withReportComments<
  TPageProps extends { version_id: number },
>(WrappedPage: React.FC<TPageProps>) {
  const WrappedComponent: React.FC<TPageProps> = (props) => (
    <Grid container spacing={2}>
      <Grid item md={8}>
        <WrappedPage {...props} />
      </Grid>

      <Grid item md={4}>
        <Suspense fallback={<div role="status">Loading comments...</div>}>
          <ReportComments version_id={props.version_id} />
        </Suspense>
      </Grid>
    </Grid>
  );

  return WrappedComponent;
}
