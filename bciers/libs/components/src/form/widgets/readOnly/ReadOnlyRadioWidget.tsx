import { WidgetProps } from "@rjsf/utils/lib/types";

const ReadOnlyRadioWidget: React.FC<WidgetProps> = (props) => {
  const { id, value, uiSchema } = props;

  // customizedValue is used to display a custom value in the read-only widget in case we need to display a different value than the actual value
  const customizedValue = uiSchema?.["ui:options"]?.customizedValue;
  // if value is like true/false, we can use this to display Yes/No but if it's a string, we display the actual value
  const formattedValue =
    value === true ? "Yes" : value === false ? "No" : value;

  return (
    <div id={id} className="read-only-widget lg:pl-16">
      {customizedValue || formattedValue}
    </div>
  );
};
export default ReadOnlyRadioWidget;
