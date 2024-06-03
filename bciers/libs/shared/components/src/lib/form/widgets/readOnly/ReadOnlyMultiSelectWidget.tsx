import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  FieldSchema,
  mapOptions,
} from "@bciers/components/form/widgets/MultiSelectWidget";

const ReadOnlyMultiSelectWidget: React.FC<WidgetProps> = ({
  id,
  value,
  schema,
}) => {
  const fieldSchema = schema.items as FieldSchema;
  const options = mapOptions(fieldSchema);
  const selectedOptions = options.filter((option) => value.includes(option.id));
  const displayOptions = selectedOptions
    .map((option) => option.label)
    .join(",\n");

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
export default ReadOnlyMultiSelectWidget;
