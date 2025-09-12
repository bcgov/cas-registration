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
  AlertContent: React.FC<T>,
  alertType?: AlertType,
  alertIcon?: ReactNode,
) {
  // TODO: log something if the formcontext doesn't have anything (it should find a false value)

  return (props: AlertFieldTemplateProps) => (
    <AlertFieldTemplate {...props} alertType={alertType} icon={alertIcon}>
      <AlertContent {...props.formContext[props.label]} />
    </AlertFieldTemplate>
  );
}

export default AlertFieldTemplateFactory;
