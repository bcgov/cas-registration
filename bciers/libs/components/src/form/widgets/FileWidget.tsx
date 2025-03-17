"use client";

import {
  ChangeEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  dataURItoBlob,
  FormContextType,
  Registry,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
  WidgetProps,
} from "@rjsf/utils";
import { useSession } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import { AlertIcon } from "@bciers/components/icons";

const addNameToDataURL = (dataURL: string, name: string) => {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(";base64", `;name=${encodeURIComponent(name)};base64`);
};

type FileScanStatus = "Unscanned" | "Clean" | "Quarantined";

const getScanStatusFromDataURL = (dataURL: string | null): FileScanStatus => {
  if (dataURL === null) {
    return "Unscanned";
  }
  const scanStatus = dataURL.match(/scanstatus=([^;]+)/)?.[1];
  if (!scanStatus) {
    return "Unscanned";
  }
  return scanStatus as FileScanStatus;
};

type FileInfoType = {
  dataURL?: string | null;
  name: string;
  size: number;
  type: string;
  scanStatus: FileScanStatus;
};

const processFile = (file: File): Promise<FileInfoType> => {
  const { name, size, type } = file;
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        resolve({
          dataURL: addNameToDataURL(event.target.result, name),
          name,
          size,
          type,
          scanStatus: getScanStatusFromDataURL(event.target.result),
        });
      } else {
        resolve({
          dataURL: null,
          name,
          size,
          type,
          scanStatus: "Unscanned",
        });
      }
    };
    reader.readAsDataURL(file);
  });
};

const processFiles = (files: FileList) => {
  return Promise.all(Array.from(files).map(processFile));
};

// Show a different message depending on the fileScanStatus
const showScanStatus = (status: FileScanStatus | undefined) => {
  if (status === "Quarantined") {
    return (
      <div className="flex items-center justify-between text-red-500 text-sm">
        <AlertIcon />
        <span className="ml-2">
          Security risk found. Check for viruses or upload a different file.
        </span>
      </div>
    );
  }
  if (status === "Unscanned") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span>Upload in progress....</span>
          <span className="text-sm">This may take up to 5 minutes.</span>
        </div>
        <div>
          <CircularProgress size={20} className="ml-2" />
        </div>
      </div>
    );
  }
  return null;
};

function FileInfoPreview<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  fileInfo,
  registry,
}: {
  readonly fileInfo: FileInfoType;
  readonly registry: Registry<T, S, F>;
}) {
  const { translateString } = registry;
  const { dataURL, name } = fileInfo;
  if (!dataURL) {
    return null;
  }

  return (
    <>
      {" "}
      <a download={`preview-${name}`} href={dataURL} className="file-download">
        {translateString(TranslatableString.PreviewLabel)}
      </a>
    </>
  );
}

export function FilesInfo<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  filesInfo,
  preview,
  registry,
}: {
  readonly filesInfo: FileInfoType[];
  readonly preview?: boolean;
  readonly registry: Registry<T, S, F>;
}) {
  if (filesInfo.length === 0) {
    return null;
  }
  return (
    <ul className="m-0 py-0 flex flex-col justify-start list-none">
      {filesInfo.map((fileInfo) => {
        const { name, scanStatus } = fileInfo;
        return (
          <li key={name} data-name={name}>
            {showScanStatus(scanStatus) || name}
            {preview && (
              <FileInfoPreview<T, S, F>
                fileInfo={fileInfo}
                registry={registry}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export const extractFileInfo = (dataURLs: string[]): FileInfoType[] => {
  return dataURLs
    .filter((dataURL) => dataURL)
    .map((dataURL) => {
      const { blob, name } = dataURItoBlob(dataURL);
      const scanStatus = getScanStatusFromDataURL(dataURL);
      return {
        dataURL,
        name: name,
        size: blob.size,
        type: blob.type,
        scanStatus,
      };
    });
};

const FileWidget = ({
  id,
  disabled,
  readonly,
  required,
  multiple,
  onChange,
  value,
  options,
  registry,
}: WidgetProps) => {
  // We need to store the value in state to prevent loosing the value when user switches between tabs
  const [localValue, setLocalValue] = useState(value);
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>(
    Array.isArray(localValue)
      ? extractFileInfo(localValue)
      : extractFileInfo([localValue]),
  );
  // 🥷 Prevent resetting the value to null when user switch tabs
  useEffect(() => {
    if (localValue && !value) {
      onChange(localValue);
    }
  }, [localValue, onChange, value]);

  const { data: session } = useSession();
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const maxSize = 20000000;
      const files = event.target.files;
      if (!files) {
        return;
      }

      processFiles(files).then((filesInfoEvent) => {
        const newValue = filesInfoEvent.map((fileInfo) => {
          if (fileInfo.size > maxSize) {
            alert("File size must be less than 20MB");
            return;
          }
          return fileInfo.dataURL;
        });
        if (multiple) {
          setFilesInfo(filesInfo.concat(filesInfoEvent[0]));
          onChange(localValue.concat(newValue[0]));
          setLocalValue(localValue.concat(newValue[0]));
        } else {
          setFilesInfo(filesInfoEvent);
          onChange(newValue[0]);
          setLocalValue(newValue[0]);
        }
      });
    },
    [multiple, localValue, filesInfo, onChange],
  );

  const disabledColour =
    disabled || readonly ? "text-bc-bg-dark-grey" : "text-bc-link-blue";

  /*   File input styling options are limited so we are attaching a ref to it, hiding it and triggering it with a styled button. */
  return (
    <div className="py-4 flex">
      {!isCasInternal && (
        <button
          type="button"
          onClick={handleClick}
          className={`p-0 decoration-solid border-0 text-lg bg-transparent cursor-pointer underline ${disabledColour}`}
        >
          {localValue ? "Reupload attachment" : "Upload attachment"}
        </button>
      )}
      <input
        id={id}
        name={id}
        ref={hiddenFileInput}
        data-testid={id}
        onChange={handleChange}
        style={{ display: "none" }}
        type="file"
        required={required}
        className="hidden"
        disabled={disabled || readonly}
        value=""
        accept={options.accept ? String(options.accept) : undefined}
      />
      {localValue ? (
        <FilesInfo
          registry={registry}
          filesInfo={filesInfo}
          preview={options.filePreview}
        />
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default FileWidget;
