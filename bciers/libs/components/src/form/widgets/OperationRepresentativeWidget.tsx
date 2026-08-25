import { WidgetProps } from "@rjsf/utils";
import {
  FieldSchemaWithTooltip as FieldSchema,
  mapOptionsWithTooltips as mapOptions,
} from "@bciers/components/form/widgets/MultiSelectWidgetWithTooltip";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { BC_GOV_SEMANTICS_RED } from "@bciers/styles";
import SnackBar from "../components/SnackBar";
import { IconButton } from "@mui/material";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

async function removeOperationRepresentative(
  operation_id: string,
  // Id will always be a number for operation representatives. We have to additionally type string to make FieldSchema happy.
  representative_id: number | string,
  step: number,
) {
  const response = await actionHandler(
    `registration/operations/${operation_id}/registration/operation-representative`,
    "PUT",
    `/register-an-operation/${operation_id}/${step}`,
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
  registry,
  uiSchema,
  onChange,
}) => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const { setErrors, renderedErrors } = useValidationErrors();
  const { formContext } = registry;

  if (renderedErrors) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        {renderedErrors}
      </div>
    );
  }

  const fieldSchema = schema.items as FieldSchema;
  const options = mapOptions(
    fieldSchema,
    uiSchema?.["ui:enumNames"] as string[],
  );
  const selectedOptions = options.filter((option) => value.includes(option.id));

  const displayOptions = selectedOptions.map((option, index) => (
    <span key={index}>
      {option.label}
      <IconButton aria-label="delete">
        <DeleteOutlineIcon
          key={option.id}
          style={{ color: BC_GOV_SEMANTICS_RED }}
          onClick={async () => {
            setErrors(undefined);
            const response = await removeOperationRepresentative(
              formContext?.operationId,
              option.id,
              formContext?.step,
            );
            if (!handleApiResponse(response, setErrors)) {
              return;
            }
            // Keep the form data in sync with the server, otherwise the deleted
            // id lingers in the form data and fails enum validation on the next
            // save (the item disappears from the list but not from the data)
            onChange(
              (value as (number | string)[]).filter(
                (repId) => repId !== option.id,
              ),
            );
            setIsSnackbarOpen(true);
          }}
        />
      </IconButton>
    </span>
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
