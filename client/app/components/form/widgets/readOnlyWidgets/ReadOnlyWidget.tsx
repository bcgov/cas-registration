import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <div id={id} className="w-full min-h-[50px] flex items-center">
      {value}
    </div>
  );
};
export default ReadOnlyWidget;
