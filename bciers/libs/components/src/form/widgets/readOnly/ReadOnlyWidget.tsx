import { WidgetProps } from "@rjsf/utils/lib/types";
import { NumberField } from "@base-ui-components/react/number-field";

const ReadOnlyWidget: React.FC<WidgetProps> = ({
  id,
  value,
  uiSchema,
  schema,
  disabled,
  onChange,
  rawErrors,
  readonly,
  placeholder,
  name,
}) => {
  const numberStyles = {
    border: "1px solid",
    // borderColor: borderColor,
    font: "inherit",
    width: "100%",
    padding: "14px",
    borderRadius: "4px",
  };

  const widthStyle = {
    width: "100%",
  };
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(",\n");
    }
    const type = schema.type === "number" ? "number" : "text";
    if (type === "number") {
      return (
        <NumberField.Root
          id={id}
          name={name}
          disabled
          value={value}
          style={widthStyle}
          format={{ maximumFractionDigits: 4 }}
        >
          <NumberField.Group>
            <NumberField.Input
              aria-label={name}
              style={numberStyles}
              // sx doesn't like numberInput and tailwind doesn't like dynamic colors
            />
          </NumberField.Group>
        </NumberField.Root>
      );
    }
    return value;
  };

  const prefix = uiSchema?.["ui:options"]?.prefix as string;
  const suffix = uiSchema?.["ui:options"]?.suffix as string;

  return (
    <div id={id} className="read-only-widget whitespace-pre-line">
      {prefix && <span className="prefix">{prefix}</span>}
      {formatValue(value)}
      {suffix && <span className="suffix">{suffix}</span>}
    </div>
  );
};
export default ReadOnlyWidget;
