import { Button, Stack } from "@mui/material";

interface Props {
  onCancel: () => void;
  onSave?: () => void;
  savingDisabled: boolean;
  cancelDisabled: boolean;
}

const SaveAndCancelButtons: React.FC<Props> = ({
  onCancel,
  onSave,
  savingDisabled,
  cancelDisabled,
}) => {
  return (
    <Stack direction="row" spacing={2} className="mt-2">
      <Button
        variant="contained"
        color="primary"
        sx={{ width: "50%" }}
        type="submit"
        onClick={onSave}
        disabled={savingDisabled}
      >
        Save
      </Button>
      <Button
        variant="outlined"
        sx={{ width: "50%" }}
        type="button"
        onClick={onCancel}
        disabled={cancelDisabled}
      >
        Cancel
      </Button>
    </Stack>
  );
};

export default SaveAndCancelButtons;
