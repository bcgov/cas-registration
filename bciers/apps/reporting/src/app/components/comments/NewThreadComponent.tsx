import { Button, MenuItem, Stack, TextField } from "@mui/material";
import ThreadFrame from "./ThreadFrame";
import { useState, useTransition } from "react";
import { FacilityItem, Thread } from "./types";
import postCommentThread from "../../utils/postCommentThread";
import { useValidationErrors } from "@bciers/components/validationErrors/useValidationErrors";
import { setClientError } from "@bciers/components/validationErrors/utils";
import { handleApiResponse } from "@bciers/components/validationErrors/handleApiResponse";

interface Props {
  version_id: number;
  facilities: FacilityItem[];
  onThreadCreated: (thread: Thread) => void;
  onCancel: () => void;
}

const NewThreadComponent: React.FC<Props> = ({
  version_id,
  facilities,
  onThreadCreated,
  onCancel,
}) => {
  const [newThreadData, setNewThreadData] = useState<{
    comment?: string;
    facility?: string;
  }>({});

  const { setErrors, renderedErrors } = useValidationErrors();
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!newThreadData.comment?.trim()) {
      setClientError("Comment cannot be empty", setErrors);
      return;
    }

    const newComment = newThreadData.comment?.trim();
    const newFacility = newThreadData.facility || undefined;

    setErrors([]);

    startTransition(async () => {
      const response = await postCommentThread(
        version_id,
        newComment,
        newFacility,
      );
      const isSuccess = handleApiResponse(response, setErrors);
      if (!isSuccess) {
        return;
      }
      onThreadCreated(response as Thread);
    });
  };

  const handleCancel = () => {
    onCancel();
  };

  // Factory to create change handlers based on the field it is for
  // And update its new value in the component state
  const changeHandlerFactory =
    (field: string) => (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNewThreadData((tData) => ({
        ...tData,
        [field]: evt.target.value,
      }));
    };

  return (
    <ThreadFrame version_id={version_id}>
      <Stack spacing={2} className="mt-4">
        <TextField
          select
          fullWidth
          label="Facility (optional)"
          defaultValue=""
          onChange={changeHandlerFactory("facility")}
        >
          <MenuItem value="">Select Facility</MenuItem>
          {facilities.map((facility) => (
            <MenuItem key={facility.facility_id} value={facility.facility_id}>
              {facility.facility_name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Comment"
          multiline
          rows={3}
          onChange={changeHandlerFactory("comment")}
        />
        {renderedErrors}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "50%" }}
            type="button"
            onClick={handleSubmit}
            disabled={pending}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{ width: "50%" }}
            type="button"
            onClick={handleCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </ThreadFrame>
  );
};

export default NewThreadComponent;
