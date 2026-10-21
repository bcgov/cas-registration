import { Alert } from "@mui/material";
import { getToken } from "@bciers/actions";
import CommentsSidebar from "./CommentsSidebar";
import { getCommentThreads } from "../../utils/getCommentThreads";

const ReportComments: React.FC<{ version_id: number }> = async ({
  version_id,
}) => {
  const data = await Promise.all([
    getCommentThreads(version_id),
    getToken(),
  ]).catch((error: unknown) => {
    console.error("Failed to load report comments", error);
    return null;
  });
  const alert = <Alert severity="error">Comments could not be loaded.</Alert>;
  if (!data) {
    return alert;
  }
  const [threadsResponse, token] = data;
  if (!threadsResponse) {
    return alert;
  }

  return (
    <CommentsSidebar
      version_id={version_id}
      threads={threadsResponse.threads}
      facilities={threadsResponse.facilities}
      userRole={token.app_role}
      userId={token.user_guid}
    />
  );
};

export default ReportComments;
