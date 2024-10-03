import { Button } from "@mui/material";
import LoadingSpinner from "@bciers/components/loading/LoadingSpinner";

interface SubmitButtonProps {
  children?: React.ReactNode | string;
  disabled?: boolean;
  isSubmitting: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
  variant?: "contained" | "outlined";
}

const SubmitButton = ({
  children = "Submit",
  disabled,
  isSubmitting,
  onClick,
  type = "submit",
  variant = "contained",
}: SubmitButtonProps) => {
  const isDisabled = disabled || isSubmitting;

  const spinnerClass =
    "absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full min-w-10 h-10";

  return (
    <Button
      type={type}
      variant={variant}
      disabled={isDisabled}
      onClick={onClick}
    >
      <div
        className={spinnerClass}
        style={{
          visibility: isSubmitting ? "visible" : "hidden",
        }}
      >
        <LoadingSpinner />
      </div>
      <div
        className="w-full"
        style={{
          visibility: isSubmitting ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </Button>
  );
};

export default SubmitButton;
