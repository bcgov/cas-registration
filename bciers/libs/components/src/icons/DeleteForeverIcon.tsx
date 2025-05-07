import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { SxProps } from "@mui/material";

interface Props {
  sx?: SxProps;
}

const DeleteForeverIcon = ({ sx }: Props) => (
  <DeleteForever
    sx={{
      color: BC_GOV_BACKGROUND_COLOR_BLUE,
      ...sx, // allow overrides if needed
    }}
  />
);

export default DeleteForeverIcon;
