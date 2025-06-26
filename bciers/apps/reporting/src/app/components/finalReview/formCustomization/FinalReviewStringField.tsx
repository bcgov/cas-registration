import { NumberField } from "@base-ui-components/react/number-field";
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

  if (props.schema.type === "number") {
    return (
      <NumberField.Root
        id={props.id}
        name={props.name}
        disabled
        value={props.formData ? Number(props.formData) : props.formData}
        format={{
          // set the fraction digits based on how many decimal places that value returned from the API has. Lat/long can have up to 8, and some calculated values can have up to 4.
          maximumFractionDigits: props.formData
            ? props.formData.toString().split(".")[1]?.length
            : 4,
          // sometimes numbers are returned
          minimumFractionDigits: props.formData
            ? props.formData.toString().split(".")[1]?.length
            : 0,
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
