import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import { Box } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";

const getCheckboxColumnCell = (
  onCheckBoxChange: (rowIndex: number, checked: boolean) => void,
) => {
  return (params: GridRenderCellParams<FacilityRow>) => {
    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const isCompleted = event.target.checked;

      // update the UI
      params.api.updateRows([
        {
          ...params.row,
          is_completed: isCompleted,
        },
      ]);

      const rowIndex = params.api.getRowIndexRelativeToVisibleRows(
        params.row.id,
      );
      onCheckBoxChange(rowIndex, isCompleted);
    };

    return (
      <FormControl
        sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Checkbox
          checked={Boolean(params.row.is_completed)}
          onChange={handleCheckboxChange}
          inputProps={{ "aria-label": "Report Status" }}
        />
        <Box>Completed</Box>
      </FormControl>
    );
  };
};

export default getCheckboxColumnCell;
