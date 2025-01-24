import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  FieldSchema,
  mapOptions,
} from "@bciers/components/form/widgets/MultiSelectWidget";

const FinalReviewMultiSelectWidget: React.FC<WidgetProps> = ({
  id,
  value,
  schema,
  uiSchema,
}) => {
  const fieldSchema = schema.items as FieldSchema;
  const options = mapOptions(fieldSchema);
  const selectedOptions = options.filter((option) => value.includes(option.id));
  const displayInline = uiSchema?.["ui:inline"];
  const separator = displayInline ? ", " : "\n";

  const displayOptions = selectedOptions
    .map((option) => `${displayInline ? "" : "- "}${option.label}`)
    .join(separator);

  return (
    <div
      id={id}
      // Use whitespace-pre-line to display items with \n line breaks
      className="read-only-widget whitespace-pre-line"
    >
      {displayOptions}
    </div>
  );
};

export default FinalReviewMultiSelectWidget;
