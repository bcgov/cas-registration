import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  FieldSchema,
  mapOptions,
} from "@bciers/components/form/widgets/MultiSelectWidget";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { BC_GOV_SEMANTICS_RED } from "@bciers/styles";
import SnackBar from "../components/SnackBar";
import { IconButton } from "@mui/material";

async function removeOperationRepresentative(
  operation_id: string,
  // Id will always be a number for operation representatives. We have to additionally type string to make FieldSchema happy.
  representative_id: number | string,
) {
  const response = await actionHandler(
    `registration/v2/operations/${operation_id}/registration/operation-representative`,
    "PUT",
    `registration/administration/operations/${operation_id}`,
    {
      body: JSON.stringify({ id: representative_id }),
    },
  );
  return response;
}

const OperationRepresentativeWidget: React.FC<WidgetProps> = ({
  id,
  value,
  schema,
  formContext,
}) => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [error, setError] = useState(undefined);

  if (error) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Error: {error}
      </div>
    );
  }

  const fieldSchema = schema.items as FieldSchema;
  const options = mapOptions(fieldSchema);
  const selectedOptions = options.filter((option) => value.includes(option.id));

  const displayOptions = selectedOptions.map((option) => (
    <>
      {option.label}
      <IconButton aria-label="delete">
        <DeleteOutlineIcon
          key={option.id}
          style={{ color: BC_GOV_SEMANTICS_RED }}
          onClick={async () => {
            const response = await removeOperationRepresentative(
              formContext?.operationId,
              option.id,
            );
            if (response?.error) {
              setError(response.error);
              return;
            }
            setIsSnackbarOpen(true);
          }}
        />
      </IconButton>
    </>
  ));

  return (
    <div
      id={id}
      // Use whitespace-pre-line to display items with \n line breaks
      className="read-only-widget whitespace-pre-line"
    >
      {displayOptions}
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Operation Representative removed successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </div>
  );
};

export default OperationRepresentativeWidget;
