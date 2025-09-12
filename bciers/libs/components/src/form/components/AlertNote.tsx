import { ReactNode, FC } from "react";
import { AlertIcon } from "@bciers/components/icons";
import { Alert, SvgIconProps } from "@mui/material";
import { BC_GOV_TEXT } from "@bciers/styles";
import { ErrorRounded, InfoRounded, WarningRounded } from "@mui/icons-material";

export type AlertType = "INFO" | "ALERT" | "ERROR" | "DEFAULT";

export interface AlertNoteProps {
  id?: string;
  children: ReactNode;
  icon?: ReactNode;
  alertType?: AlertType;
}

const bgClassMap: { [key in AlertType]: string } = {
  INFO: "bg-bc-light-blue",
  ALERT: "bg-bc-light-yellow",
  ERROR: "bg-bc-error-red",
  DEFAULT: "bg-bc-light-blue",
};

const defaultIconProps: SvgIconProps = {
  fontSize: "inherit",
  sx: { color: BC_GOV_TEXT },
};
const iconMap: { [key in AlertType]: ReactNode } = {
  INFO: <InfoRounded {...defaultIconProps} />,
  ALERT: <WarningRounded {...defaultIconProps} />,
  ERROR: <ErrorRounded {...defaultIconProps} />,
  DEFAULT: <AlertIcon width="25" height="25" />,
};

const AlertNote: FC<AlertNoteProps> = ({
  id,
  children,
  icon,
  alertType = "DEFAULT",
}) => {
  const defaultedIcon = icon ?? iconMap[alertType];

  return (
    <Alert
      id={id}
      className={`${bgClassMap[alertType]} text-bc-text mb-2 items-center`}
      icon={defaultedIcon}
    >
      {children}
    </Alert>
  );
};

export default AlertNote;
