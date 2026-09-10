import { Button, MenuItem, Stack, TextField } from "@mui/material";
import ThreadFrame from "./ThreadFrame";
import { useState } from "react";
import { FacilityItem } from "./types";
import AlertNote from "@bciers/components/form/components/AlertNote";

interface Props {
  version_id: number;
  facilities: FacilityItem[];
  onThreadCreated: (comment: string, facilityId?: string) => void;
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

  const [errors, setErrors] = useState<{ field: string; error: string }[]>([]);

  const handleSubmit = () => {
    if (!newThreadData.comment?.trim()) {
      setErrors([{ field: "comment", error: "Comment cannot be empty" }]);
      return;
    }
    setErrors([]);

    onThreadCreated(
      newThreadData.comment || "Unable to retrieve comment message",
      newThreadData.facility || undefined,
    );
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
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          select
          fullWidth
          label="Facility (optional)"
          defaultValue=""
          onChange={changeHandlerFactory("facility")}
          error={errors.some((e) => e.field === "facility")}
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
          error={errors.some((e) => e.field === "comment")}
        />
        {errors.length > 0 && (
          <AlertNote alertType="ERROR">
            {errors.map((error, index) => (
              <div key={index}>{error.error}</div>
            ))}
          </AlertNote>
        )}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "50%" }}
            type="button"
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{ width: "50%" }}
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </ThreadFrame>
  );
};

export default NewThreadComponent;
