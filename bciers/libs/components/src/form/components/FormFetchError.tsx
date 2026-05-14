import type { ReactNode } from "react";
import AlertNote from "./AlertNote";

interface Props {
  error?: string;
  children: ReactNode;
}

const FormFetchError = ({ error, children }: Props) =>
  error ? <AlertNote alertType="ERROR">{error}</AlertNote> : <>{children}</>;

export default FormFetchError;
