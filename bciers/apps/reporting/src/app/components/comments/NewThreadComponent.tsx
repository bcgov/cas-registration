import { Button, MenuItem, Stack, TextField } from "@mui/material";
import ThreadFrame from "./ThreadFrame";
import { Thread } from "./types";
import { useState } from "react";
import { useSession } from "next-auth/react";
import getUserFullName from "@bciers/utils/src/getUserFullName";
import dayjs from "dayjs";

interface Props {
  version_id: number;
  facilities: string[];
  onThreadCreated: (thread: Thread) => void;
  onCancel: () => void;
}

const NewThreadComponent: React.FC<Props> = ({
  version_id,
  facilities,
  onThreadCreated,
  onCancel,
}) => {
  const { data: session } = useSession();

  const [newThreadData, setNewThreadData] = useState<{
    comment?: string;
    facility?: string;
  }>({});

  const handleSubmit = () => {
    onThreadCreated({
      version_id: version_id,
      facility_name: newThreadData.facility || undefined,
      comments: [
        {
          version_id: version_id,
          author: getUserFullName(session),
          timestamp: dayjs().format("MMM D, YYYY h:mm A"),
          comment: newThreadData.comment ?? "",
        },
      ],
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
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          select
          fullWidth
          label="Facility (optional)"
          defaultValue=""
          onChange={changeHandlerFactory("facility")}
        >
          <MenuItem value="">Select Facility</MenuItem>
          {facilities.map((facility) => (
            <MenuItem key={facility} value={facility}>
              {facility}
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
