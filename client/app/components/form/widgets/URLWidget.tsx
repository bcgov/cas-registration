"use client";

import { useEffect } from "react";
import TextWidget from "./TextWidget";
import { WidgetProps } from "@rjsf/utils/lib/types";

const URLWidget: React.FC<WidgetProps> = (props) => {
  const { onChange, value } = props;

  useEffect(() => {
    // Set value to undefined if it's an empty string as this was causing validation to trigger
    // If a user had previously saved a URL, then deleted it the field would have an empty string
    if (!value) {
      onChange(undefined);
    }
  }, [value, onChange]);

  return <TextWidget {...props} type="url" />;
};
export default URLWidget;
