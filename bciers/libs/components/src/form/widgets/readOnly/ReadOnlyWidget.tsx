import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value, uiSchema }) => {
  const formatValue = Array.isArray(value) ? value.join(",\n") : value;
  const customClassName = uiSchema?.["ui:className"] ?? "";

  return (
    <div
      id={id}
      className={`read-only-widget whitespace-pre-line ${customClassName}`}
    >
      {formatValue}
    </div>
  );
};
export default ReadOnlyWidget;
