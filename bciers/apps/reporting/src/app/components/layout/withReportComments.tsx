import { Suspense } from "react";
import { Alert, Grid } from "@mui/material";
import { getToken } from "@bciers/actions";
import CommentsSidebar from "../comments/CommentsSidebar";
import { getCommentThreads } from "../../utils/getCommentThreads";

async function ReportComments({ version_id }: { version_id: number }) {
  const data = await Promise.all([getCommentThreads(version_id), getToken()]);
  if (!data) {
    return <Alert severity="error">Comments could not be loaded.</Alert>;
  }
  const [threadsResponse, token] = data;
  if (!threadsResponse) {
    return <Alert severity="error">Comments could not be loaded.</Alert>;
  }

  return (
    <CommentsSidebar
      version_id={version_id}
      threads={threadsResponse.threads}
      facilities={threadsResponse.facilities}
      userRole={token.app_role}
    />
  );
}

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
