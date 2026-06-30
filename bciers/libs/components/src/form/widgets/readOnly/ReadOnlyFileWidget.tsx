"use client";

import { WidgetProps } from "@rjsf/utils";
import { FileElement } from "../FileWidget";

const ReadOnlyFileWidget: React.FC<WidgetProps> = ({ id, options, value }) => {
  const parsedValue = value ? JSON.parse(value) : undefined;

  return (
    <div id={id} className="read-only-widget">
      {parsedValue ? (
        <FileElement fileInfo={parsedValue} preview={options?.filePreview} />
      ) : (
        <>No attachment was uploaded.</>
      )}
    </div>
  );
};
export default ReadOnlyFileWidget;
