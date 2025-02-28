"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { useEffect, useState } from "react";
import { handleValue } from "../FileWidget";

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
  const { downloadUrl, extractedFileName } = handleValue(value);
  console.log("downloadUrl", downloadUrl);
  console.log("extractedFileName", extractedFileName);
  return (
    <div id={id} className="read-only-widget">
      {value ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            {/* brianna gotta make this work */}
            <a
              download={extractedFileName}
              href={downloadUrl}
              className="file-download"
            >
              {extractedFileName}
            </a>
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};
export default ReadOnlyFileWidget;
