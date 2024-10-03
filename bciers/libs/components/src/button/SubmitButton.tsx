import { Button } from "@mui/material";
import LoadingSpinner from "@bciers/components/loading/LoadingSpinner";
import { BC_GOV_PRIMARY_BRAND_COLOR_BLUE } from "@bciers/styles/colors";
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

  const spinnerContainerClass =
    "absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full min-w-10 h-10";

  return (
    <Button
      type={type}
      variant={variant}
      disabled={isDisabled}
      style={
        isSubmitting
          ? {
              opacity: 0.5,
              backgroundColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
            }
          : {
              opacity: 1,
            }
      }
      onClick={onClick}
    >
      <div
        data-testid="spinner"
        className={spinnerContainerClass}
        style={{
          visibility: isSubmitting ? "visible" : "hidden",
        }}
      >
        <LoadingSpinner />
      </div>
      <div
        className="w-full"
        style={{
          // Using visibility instead of display to prevent the button width from shrinking when the text is hidden
          visibility: isSubmitting ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </Button>
  );
};

export default SubmitButton;
