import { Button, MenuItem, Stack, TextField } from "@mui/material";
import ThreadFrame from "./ThreadFrame";
import { Thread } from "./types";
import { SubmitEventHandler } from "react";

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
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = new FormData(evt.target);

    console.log("submit", evt);
  };

  const handleCancel = () => {
    console.log("cancel");
  };

  return (
    <ThreadFrame version_id={version_id}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="Facility (optional)"
            defaultValue=""
          >
            <MenuItem value="">Select Facility</MenuItem>
            {facilities.map((facility) => (
              <MenuItem key={facility} value={facility}>
                {facility}
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Comment" multiline rows={3} />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "50%" }}
              type="submit"
            >
              Save
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "50%" }}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </ThreadFrame>
  );
};

export default NewThreadComponent;
