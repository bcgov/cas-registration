"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { handleValue } from "../FileWidget";

const ReadOnlyFileWidget: React.FC<WidgetProps> = ({ id, value }) => {
  const { downloadUrl, extractedFileName } = handleValue(value);

  return (
    <div id={id} className="read-only-widget">
      {value ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            <a
              download={extractedFileName}
              href={downloadUrl}
              className="file-download"
              target="_blank"
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
