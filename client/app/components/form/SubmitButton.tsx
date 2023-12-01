"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  classNames?: string;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
  classNames,
}) => {
  const { pending } = useFormStatus();
  return (
    <div className={classNames}>
      <Button
        variant="contained"
        type="submit"
        aria-disabled={pending}
        className="h-full"
      >
        {label}
      </Button>
    </div>
  );
};
export default SubmitButton;
