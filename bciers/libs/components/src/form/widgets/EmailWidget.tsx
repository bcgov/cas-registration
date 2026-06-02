"use client";

import TextWidget from "./TextWidget";
import { WidgetProps } from "@rjsf/utils";

const EmailWidget: React.FC<WidgetProps> = (props) => {
  return <TextWidget {...props} type="email" />;
};
export default EmailWidget;
