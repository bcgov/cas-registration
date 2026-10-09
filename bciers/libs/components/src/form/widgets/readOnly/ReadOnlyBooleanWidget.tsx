import { WidgetProps } from "@rjsf/utils";

const ReadOnlyBooleanWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <div id={id} className="read-only-widget py-2.25">
      {value ? "Yes" : "No"}
    </div>
  );
};
export default ReadOnlyBooleanWidget;
