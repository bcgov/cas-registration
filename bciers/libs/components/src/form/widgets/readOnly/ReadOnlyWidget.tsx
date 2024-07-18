import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  if (Array.isArray(value)) {
    return (
      <div id={id} className="read-only-widget">
        {value.join(", ")}
      </div>
    );
  }
  return (
    <div id={id} className="read-only-widget">
      {value}
    </div>
  );
};
export default ReadOnlyWidget;
