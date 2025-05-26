import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value, uiSchema }) => {
  const formatValue = Array.isArray(value) ? value.join(",\n") : value;
  const prefix = uiSchema?.["ui:options"]?.prefix as string;
  const suffix = uiSchema?.["ui:options"]?.suffix as string;

  return (
    <div id={id} className="read-only-widget whitespace-pre-line">
      {prefix && <span className="prefix">{prefix}</span>}
      {formatValue}
      {suffix && <span className="suffix">{suffix}</span>}
    </div>
  );
};
export default ReadOnlyWidget;
