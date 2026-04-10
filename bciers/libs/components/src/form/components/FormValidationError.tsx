import FormAlerts from "@bciers/components/form/FormAlerts";

interface FormValidationErrorProps {
  message?: string;
}

const FormValidationError = ({
  message = "This form can't be saved yet. Please fix the errors above.",
}: FormValidationErrorProps) => <FormAlerts errors={[message]} />;

export default FormValidationError;
