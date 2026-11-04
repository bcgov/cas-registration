import { Alert } from "@mui/material";
import CommentsSidebar from "./CommentsSidebar";
import { getCommentThreads } from "../../utils/comments/getCommentThreads";

const ReportComments: React.FC<{ version_id: number }> = async ({
  version_id,
}) => {
  const response = await getCommentThreads(version_id).catch(
    (error: unknown) => {
      console.error("Failed to load report comments", error);
      return null;
    },
  );
  if (!response) {
    return <Alert severity="error">Comments could not be loaded.</Alert>;
  }
  return (
    <CommentsSidebar
      version_id={version_id}
      threads={response.threads}
      facilities={response.facilities}
      canMakeComment={response.can_create_comment_thread}
    />
  );
};

export default ReportComments;
