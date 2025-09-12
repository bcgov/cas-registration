"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import AlertNote, { AlertNoteProps, AlertType } from "../components/AlertNote";

type AlertFieldTemplateProps = FieldTemplateProps & AlertNoteProps;

function AlertFieldTemplate({
  id,
  alertType,
  children,
}: AlertFieldTemplateProps) {
  return (
    <AlertNote id={id} alertType={alertType}>
      {children}
    </AlertNote>
  );
}

function AlertFieldTemplateFactory<T>(
  alertType: AlertType,
  AlertContent: React.FC<T>,
) {
  return (props: AlertFieldTemplateProps) => (
    <AlertFieldTemplate {...props}>
      <AlertContent {...props.formContext} />
    </AlertFieldTemplate>
  );
}

export default AlertFieldTemplateFactory;
