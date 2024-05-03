import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyComboBoxWidget: React.FC<WidgetProps> = ({
  id,
  value,
  schema,
}) => {
  const fieldSchema = schema?.anyOf as [
    { const?: string; title: string; value?: string },
  ];
  const selectedValue =
    fieldSchema &&
    value &&
    fieldSchema.find(
      (option) =>
        (option as any).const === value || (option as any).value === value,
    );

  return (
    <div id={id} className="read-only-widget">
      {selectedValue?.title ?? value}
    </div>
  );
};
export default ReadOnlyComboBoxWidget;
