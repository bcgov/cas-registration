"use client";

import TextWidget from "./TextWidget";
import { WidgetProps } from "@rjsf/utils/lib/types";

const URLWidget: React.FC<WidgetProps> = (props) => {
  return <TextWidget {...props} type="url" />;
};
export default URLWidget;
