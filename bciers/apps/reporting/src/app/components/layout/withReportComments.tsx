// Higher-order component to wrap a report page with comment functionality

import { Grid } from "@mui/material";
import CommentsSidebar from "../comments/CommentsSidebar";
import { getCommentThreads } from "../../utils/getCommentThreads";
import { getToken } from "@bciers/actions";

export default function withReportComments<
  TPageProps extends { version_id: number },
>(WrappedPage: React.FC<TPageProps>) {
  const WrappedComponent: React.FC<TPageProps> = async (props) => {
    const threadsResponse = await getCommentThreads(props.version_id);
    const token = await getToken();
    return (
      <Grid container spacing={2}>
        <Grid item md={8}>
          <WrappedPage {...props} />
        </Grid>
        <Grid item md={4}>
          <CommentsSidebar
            version_id={props.version_id}
            threads={threadsResponse.threads}
            facilities={threadsResponse.facilities}
            userId={token.user_guid}
          />
        </Grid>
      </Grid>
    );
  };

  return WrappedComponent;
}
