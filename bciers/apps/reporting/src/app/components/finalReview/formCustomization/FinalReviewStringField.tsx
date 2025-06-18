import { FieldProps } from "@rjsf/utils";

export default function FinalReviewStringField(props: FieldProps) {
  // brianna this is where the final review numbers come from
  // console.log("------------------------");
  // console.log("name", props.name, "value", props.formData);
  // console.log("type of value", typeof props.formData);
  // console.log("props.type", props.schema.type);
  // console.log("------------------------");

  // Adds thousand separator commas to a numeric string
  function formatValue(props: FieldProps): string {
    if (props.schema.type === "number" && typeof props.formData === "string") {
      console.log("props.formData", props.formData);
      const [integerPart, decimalPart] = props.formData.split(".");
      const formattedInteger = parseInt(integerPart, 10).toLocaleString();
      return decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
    }
    return props.formData;
  }

  return <div>{formatValue(props)}</div>;
}
