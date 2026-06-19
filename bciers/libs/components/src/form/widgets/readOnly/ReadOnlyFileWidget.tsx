"use client";

import { WidgetProps } from "@rjsf/utils";
import { FileElement } from "../FileWidget";

const ReadOnlyFileWidget: React.FC<WidgetProps> = ({ id, options, value }) => {
  return (
    <div id={id} className="read-only-widget">
      {value ? (
        <FileElement value={value} preview={options?.filePreview} />
      ) : (
        <>No attachment was uploaded.</>
      )}
    </div>
  );
};
export default ReadOnlyFileWidget;
