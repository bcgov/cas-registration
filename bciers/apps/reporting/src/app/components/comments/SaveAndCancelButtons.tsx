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
        className="w-1/2"
        variant="contained"
        color="primary"
        type="submit"
        onClick={onSave}
        disabled={savingDisabled}
      >
        Save
      </Button>
      <Button
        className="w-1/2"
        variant="outlined"
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
