import type { ReactNode, FC, PropsWithChildren } from "react";
import { AlertIcon } from "@bciers/components/icons";
import { Alert, SvgIconProps } from "@mui/material";
import { BC_GOV_SEMANTICS_RED, BC_GOV_TEXT } from "@bciers/styles";
import { ErrorRounded, InfoRounded, WarningRounded } from "@mui/icons-material";

export type AlertType = "INFO" | "ALERT" | "ERROR" | "DEFAULT";

export interface AlertNoteProps {
  id?: string;
  icon?: ReactNode;
  alertType?: AlertType;
  iconColor?: string;
}

const bgClassMap: { [key in AlertType]: string } = {
  INFO: "bg-bc-light-blue",
  ALERT: "bg-bc-light-yellow",
  ERROR: "bg-bc-light-red border border-[#F1B5B8]",
  DEFAULT: "bg-bc-light-blue",
};

const defaultIconProps: SvgIconProps = {
  fontSize: "inherit",
  sx: { color: BC_GOV_TEXT },
};
const iconMap: { [key in AlertType]: ReactNode } = {
  INFO: <InfoRounded {...defaultIconProps} />,
  ALERT: <WarningRounded {...defaultIconProps} />,
  ERROR: (
    <ErrorRounded {...defaultIconProps} sx={{ color: BC_GOV_SEMANTICS_RED }} />
  ),
  DEFAULT: <AlertIcon width="25" height="25" />,
};

const AlertNote: FC<PropsWithChildren<AlertNoteProps>> = ({
  id,
  children,
  icon,
  alertType = "DEFAULT",
  iconColor,
}) => {
  const defaultedIcon =
    icon ??
    (iconColor
      ? (() => {
          const color = iconColor;
          switch (alertType) {
            case "INFO":
              return <InfoRounded fontSize="inherit" sx={{ color }} />;
            case "ALERT":
              return <WarningRounded fontSize="inherit" sx={{ color }} />;
            case "ERROR":
              return <ErrorRounded fontSize="inherit" sx={{ color }} />;
            default:
              return <AlertIcon width="25" height="25" fill={color} />;
          }
        })()
      : iconMap[alertType]);

  return (
    <Alert
      id={id}
      className={`${bgClassMap[alertType]} text-bc-text mb-2 items-center`}
      icon={defaultedIcon}
      // MUI Alert applies its own default error background styles,
      // so the ERROR state needs an sx override to render ERROR alertType background
      sx={
        alertType === "ERROR"
          ? {
              backgroundColor: "#FBEAEA",
              border: "1px solid #F1B5B8",
            }
          : undefined
      }
    >
      {children}
    </Alert>
  );
};

export default AlertNote;
