"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
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
  return (
    <div id={id} className="read-only-widget">
      {value ? (
        <FilesInfo
          filesInfo={
            Array.isArray(value)
              ? extractFileInfo(value)
              : extractFileInfo([value])
          }
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
