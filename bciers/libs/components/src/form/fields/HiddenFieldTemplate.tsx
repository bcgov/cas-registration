import { FieldTemplateProps } from "@rjsf/utils";
import { InlineFieldTemplate } from "@bciers/components/form/fields/index";

// Custom field to control visibility of both widget and label
const HiddenFieldTemplate: React.FC<FieldTemplateProps> = (props) => {
  const { formData } = props;

  // Check if value is defined, not null, not empty string, and not empty array
  const hasValue =
    formData !== undefined &&
    formData !== null &&
    formData !== "" &&
    (!Array.isArray(formData) || formData.length > 0);

  // If no value, return null to hide the entire field (including label)
  if (!hasValue) return null;

  return <InlineFieldTemplate {...props} />;
};

export default HiddenFieldTemplate;
