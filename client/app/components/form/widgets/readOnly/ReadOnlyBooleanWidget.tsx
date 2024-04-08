import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyBooleanWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <div id={id} className="read-only-widget py-[9px]">
      {value ? "Yes" : "No"}
    </div>
  );
};
export default ReadOnlyBooleanWidget;
