"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { useEffect, useState } from "react";
import {
  extractFileInfo,
  FilesInfo,
} from "@bciers/components/form/widgets/FileWidget";

const ReadOnlyFileWidget: React.FC<WidgetProps> = ({
  id,
  options,
  registry,
  value,
}) => {
  const [fileInfo, setFileInfo] = useState<any[]>([]);
  const fileValue = Array.isArray(value) ? value : [value];

  useEffect(() => {
    // Fix for window not being defined on page load
    if (fileValue.length) {
      setFileInfo(fileValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id={id} className="read-only-widget">
      {value ? (
        <FilesInfo
          filesInfo={extractFileInfo(fileInfo)}
          preview={options.filePreview}
          registry={registry}
        />
      ) : (
        <>No attachment was uploaded</>
      )}
    </div>
  );
};
export default ReadOnlyFileWidget;
