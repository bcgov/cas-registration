import { NumberField } from "@base-ui-components/react/number-field";
import { TextAreaWidget, TextWidget } from "@bciers/components/form/widgets";
import { padding } from "@mui/system";
import { FieldProps } from "@rjsf/utils";

export default function FinalReviewStringField(props: FieldProps) {
  // if (props.schema.type === "number" && typeof props.formData === "string") {
  //   console.log("-------------------");
  //   console.log("props.schema.type", props.schema.type);
  //   console.log("props.formData typeof", typeof props.formData);
  //   console.log("-------------------");
  // }

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
        // id={id}
        disabled
        value={Number(props.formData)}
        format={{
          maximumFractionDigits: 4,
          // sometimes numbers are returned
          minimumFractionDigits: props.formData
            ? props.formData.toString().split(".")[1]?.length
            : 0,
        }}
      >
        <NumberField.Group>
          <NumberField.Input
            // aria-label={name}
            style={numberStyles}
          />
        </NumberField.Group>
      </NumberField.Root>
    );
  }
  // return <div>finalreviewstringdfield {props.formData}</div>;
  return <div>{props.formData}</div>;
}
