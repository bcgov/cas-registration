import { ReactNode, FC } from "react";
import { AlertIcon } from "@bciers/components/icons";
import { Alert } from "@mui/material";

export interface AlertNoteProps {
  id: string;
  children: ReactNode;
  icon?: ReactNode;
  alertType: "INFO" | "ALERT" | "ERROR";
}

const bgClassMap = {
  INFO: "bg-bc-light-blue",
  ALERT: "bg-bc-yellow",
  ERROR: "bg-bc-error-red",
};

const AlertNote: FC<AlertNoteProps> = ({
  id,
  children,
  alertType = "INFO",
  icon = <AlertIcon width="25" height="25" />,
}) => {
  return (
    <Alert
      id={id}
      className={`${bgClassMap[alertType]} text-bc-text mb-2 items-center`}
      icon={icon}
    >
      {children}
    </Alert>
  );
};

export default AlertNote;
