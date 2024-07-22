import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  // If the value is an array, join it into a comma-separated string
  const formattedValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div id={id} className="read-only-widget">
      {formattedValue}
    </div>
  );
};
export default ReadOnlyWidget;
