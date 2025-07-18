import { NumberField } from "@base-ui-components/react/number-field";
import transformToNumberOrUndefined from "@bciers/utils/src/transformToNumberOrUndefined";
import { FieldProps } from "@rjsf/utils";

export const numberStyles = {
  font: "inherit",
  width: "100%",
  border: "none",
  backgroundColor: "transparent",
  color: "inherit",
  padding: 0,
};

export default function FinalReviewStringField(props: FieldProps) {
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
  return <div>{props.formData}</div>;
}
