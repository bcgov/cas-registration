import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  const formatValue = Array.isArray(value) ? value.join(",\n") : value;

  return (
    <div id={id} className="read-only-widget whitespace-pre-line">
      {formatValue}
    </div>
  );
};
export default ReadOnlyWidget;
