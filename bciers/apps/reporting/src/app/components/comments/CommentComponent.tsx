import { useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Comment } from "./types";
import { formatDate } from "@reporting/src/app/utils/formatDate";

interface Props {
  comment: Comment;
  handleDelete: (reportVersionId: number, commentId: number) => void;
  handleEdit: (
    reportVersionId: number,
    commentId: number,
    content: string,
  ) => Promise<boolean>;
  canUpdate: boolean;
}

const CommentComponent: React.FC<Props> = ({
  comment,
  handleDelete,
  handleEdit,
  canUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setDraft(comment.comment);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await handleEdit(comment.version_id, comment.id, draft);
    setIsSaving(false);
    if (success) setIsEditing(false);
  };

  return (
    <Paper className="p-4 mt-2">
      <div className="flex justify-between">
        <Typography
          variant="caption"
          className="font-bold group-[.resolved]:text-bc-component-grey"
        >
          {comment.author}
        </Typography>
        <Typography
          variant="caption"
          className="text-black/60 group-[.resolved]:text-bc-component-grey"
        >
          {comment.timestamp &&
            formatDate(
              new Date(comment.timestamp).toLocaleString("en-US", {
                timeZone: "America/Vancouver",
              }),
              "MMM D, YYYY h:mm A",
            )}
        </Typography>
        {comment.user_can_edit && canUpdate && !isEditing && (
          <div>
            <IconButton
              title="Delete comment"
              aria-label="Delete comment"
              size="small"
              onClick={() => handleDelete(comment.version_id, comment.id)}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
            <IconButton
              title="Edit comment"
              aria-label="Edit comment"
              size="small"
              onClick={startEditing}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mt-2">
          <TextField
            fullWidth
            label="Edit comment"
            multiline
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isSaving}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSave}
              disabled={!draft.trim() || draft === comment.comment || isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <Typography
          variant="body2"
          className="mt-2 group-[.resolved]:text-bc-component-grey"
        >
          {comment.comment}
        </Typography>
      )}
    </Paper>
  );
};

export default CommentComponent;
