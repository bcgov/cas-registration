// Higher-order component to wrap a report page with comment functionality

import { Grid } from "@mui/material";
import CommentsSidebar from "../comments/CommentsSidebar";

export default function withReportComments<
  TPageProps extends { version_id: number },
>(WrappedPage: React.FC<TPageProps>) {
  const WrappedComponent: React.FC<TPageProps> = (props) => {
    return (
      <Grid container spacing={2}>
        <Grid item md={8}>
          <WrappedPage {...props} />
        </Grid>
        <Grid item md={4}>
          <CommentsSidebar version_id={props.version_id} />
        </Grid>
      </Grid>
    );
  };

  return WrappedComponent;
}
