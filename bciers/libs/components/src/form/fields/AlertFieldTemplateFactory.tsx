"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import AlertNote, { AlertNoteProps, AlertType } from "../components/AlertNote";
import { ReactNode } from "react";

type AlertFieldTemplateProps = FieldTemplateProps & AlertNoteProps;

function AlertFieldTemplate({
  id,
  alertType,
  icon,
  children,
  label,
  formContext,
}: AlertFieldTemplateProps) {
  if (!formContext[label]) return null;

  return (
    <AlertNote id={id} alertType={alertType} icon={icon}>
      {children}
    </AlertNote>
  );
}

function AlertFieldTemplateFactory<T>(
  alertType: AlertType,
  AlertContent: React.FC<T>,
  alertIcon?: ReactNode,
) {
  return (props: AlertFieldTemplateProps) => (
    <AlertFieldTemplate {...props} alertType={alertType} icon={alertIcon}>
      <AlertContent {...props.formContext[props.label]} />
    </AlertFieldTemplate>
  );
}

export default AlertFieldTemplateFactory;
