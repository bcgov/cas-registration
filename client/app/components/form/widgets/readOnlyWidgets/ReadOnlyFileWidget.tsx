"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  extractFileInfo,
  FilesInfo,
} from "@/app/components/form/widgets/FileWidget";

const ReadOnlyFileWidget: React.FC<WidgetProps> = ({
  id,
  options,
  registry,
  value,
}) => {
  return (
    <div id={id} className="w-full min-h-[50px] flex items-center">
      <FilesInfo
        filesInfo={
          Array.isArray(value)
            ? extractFileInfo(value)
            : extractFileInfo([value])
        }
        preview={options.filePreview}
        registry={registry}
      />
    </div>
  );
};
export default ReadOnlyFileWidget;
