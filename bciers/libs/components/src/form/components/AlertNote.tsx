import { ReactNode, FC } from "react";
import { AlertIcon } from "@bciers/components/icons";
import { Alert } from "@mui/material";

interface AlertNoteProps {
  children: ReactNode;
  icon?: ReactNode;
}

const AlertNote: FC<AlertNoteProps> = ({
  children,
  icon = <AlertIcon width="25" height="25" />,
}) => {
  return (
    <Alert
      className="bg-bc-light-blue text-bc-text mb-2 items-center"
      icon={icon}
    >
      {children}
    </Alert>
  );
};

export default AlertNote;
