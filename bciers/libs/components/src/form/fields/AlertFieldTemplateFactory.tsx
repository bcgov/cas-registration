"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import AlertNote, { AlertNoteProps, AlertType } from "../components/AlertNote";
import { ReactNode } from "react";

type AlertFieldTemplateProps = FieldTemplateProps & AlertNoteProps;

function AlertFieldTemplate({
  id,
  alertType,
  icon,
  iconColor,
  children,
  label,
  formContext,
}: AlertFieldTemplateProps) {
  if (!formContext[label]) return null;

  return (
    <AlertNote id={id} alertType={alertType} icon={icon} iconColor={iconColor}>
      {children}
    </AlertNote>
  );
}

function AlertFieldTemplateFactory<T>(
  AlertContent: React.FC<T>,
  alertType?: AlertType,
  alertIcon?: ReactNode,
  alertIconColor?: string,
) {
  // TODO: log something if the formcontext doesn't have anything (it should find a false value)

  return (props: AlertFieldTemplateProps) => (
    <AlertFieldTemplate
      {...props}
      alertType={alertType}
      icon={alertIcon}
      iconColor={alertIconColor}
    >
      <AlertContent {...props.formContext[props.label]} />
    </AlertFieldTemplate>
  );
}

export default AlertFieldTemplateFactory;
