import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <div id={id} className="read-only-widget">
      {value}
    </div>
  );
};
export default ReadOnlyWidget;
