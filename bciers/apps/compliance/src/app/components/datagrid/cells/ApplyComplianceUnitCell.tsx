import { NumberField } from "@base-ui-components/react/number-field";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { ChangeEvent } from "react";

interface ApplyComplianceUnitCellProps extends GridRenderCellParams {
  readonly?: boolean;
  onUpdate?: (value: number) => void;
}

export const ApplyComplianceUnitCell = (
  props: ApplyComplianceUnitCellProps,
) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    row: { quantity_to_be_applied },
    onUpdate,
    readonly,
  } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const maxQuantity = Number(props.row.quantity_available);

    // Parse input to a whole number, default to 0 if invalid or empty
    const parsedValue =
      inputValue && !isNaN(Number(inputValue))
        ? Math.floor(Number(inputValue))
        : 0;

    // Cap at quantity_available and ensure non-negative
    const newValue = Math.max(0, Math.min(parsedValue, maxQuantity));

    // Update grid row with new value
    const updatedRow = { ...props.row, quantity_to_be_applied: newValue };
    props.api.updateRows([updatedRow]);

    // Notify parent of the update
    onUpdate?.(newValue);
  };

  return (
    <>
      {readonly ? (
        <div>{quantity_to_be_applied ?? 0}</div>
      ) : (
        <NumberField.Root
          id={String(props.id)}
          name={props.field}
          className="w-full"
        >
          <NumberField.Group>
            <NumberField.Input
              value={quantity_to_be_applied ?? 0}
              onChange={handleChange}
              aria-label={props.field}
              className="w-full p-[14px] border-solid rounded-md border-bc-bg-dark-grey hover:border-bc-bg-blue focus:border-bc-bg-blue outline-none"
              style={{
                font: "inherit",
              }}
            />
          </NumberField.Group>
        </NumberField.Root>
      )}
    </>
  );
};

export default ApplyComplianceUnitCell;
