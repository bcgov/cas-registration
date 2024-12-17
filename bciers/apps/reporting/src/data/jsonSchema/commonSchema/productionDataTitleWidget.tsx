import { WidgetProps } from "@rjsf/utils";

export const ProductionDataTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  return (
    <div id={id} className="w-full mt-8">
      <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-12">
        <u>Product:</u> {value}
      </h2>
    </div>
  );
};
