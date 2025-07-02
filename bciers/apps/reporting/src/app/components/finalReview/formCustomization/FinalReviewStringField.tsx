import { NumberField } from "@base-ui-components/react/number-field";
import { transformToNumberOrUndefined } from "@bciers/components/form/widgets/TextWidget";
import { FieldProps } from "@rjsf/utils";

export default function FinalReviewStringField(props: FieldProps) {
  const numberStyles = {
    font: "inherit",
    width: "100%",
    border: "none",
    backgroundColor: "transparent",
    color: "inherit",
    padding: 0,
  };

  const decimalPoints =
    props.uiSchema?.["ui:options"]?.decimalPoints &&
    Number(props.uiSchema?.["ui:options"]?.decimalPoints);

  if (props.schema.type === "number") {
    return (
      <NumberField.Root
        id={props.id}
        name={props.name}
        disabled
        value={transformToNumberOrUndefined(props.formData)}
        format={{
          maximumFractionDigits: decimalPoints || 4,
        }}
      >
        <NumberField.Group>
          <NumberField.Input style={numberStyles} name={props.name} />
        </NumberField.Group>
      </NumberField.Root>
    );
  }
  // return <div>finalreviewstringdfield {props.formData}</div>;
  return <div>{props.formData}</div>;
}
