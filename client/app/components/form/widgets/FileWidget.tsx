"use client";

import {
  ChangeEvent,
  MutableRefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { dataURItoBlob, WidgetProps } from "@rjsf/utils";

const addNameToDataURL = (dataURL: string, name: string) => {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(";base64", `;name=${encodeURIComponent(name)};base64`);
};

type FileInfoType = {
  dataURL?: string | null;
  name: string;
  size: number;
  type: string;
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
        });
      } else {
        resolve({
          dataURL: null,
          name,
          size,
          type,
        });
      }
    };
    reader.readAsDataURL(file);
  });
};

const processFiles = (files: FileList) => {
  return Promise.all(Array.from(files).map(processFile));
};

function FilesInfo({
  filesInfo,
}: {
  filesInfo: FileInfoType[];
  preview?: boolean;
}) {
  if (filesInfo.length === 0) {
    return null;
  }
  return (
    <ul className="m-0 py-0 flex flex-col justify-start">
      {filesInfo.map((fileInfo, key) => {
        const { name } = fileInfo;
        return <li key={key}>{name}</li>;
      })}
    </ul>
  );
}

const extractFileInfo = (dataURLs: string[]): FileInfoType[] => {
  return dataURLs
    .filter((dataURL) => dataURL)
    .map((dataURL) => {
      const { blob, name } = dataURItoBlob(dataURL);
      return {
        dataURL,
        name: name,
        size: blob.size,
        type: blob.type,
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
}: WidgetProps) => {
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>(
    Array.isArray(value) ? extractFileInfo(value) : extractFileInfo([value]),
  );

  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (!event.target.files) {
        return;
      }
      processFiles(event.target.files).then((filesInfoEvent) => {
        const newValue = filesInfoEvent.map((fileInfo) => fileInfo.dataURL);
        if (multiple) {
          setFilesInfo(filesInfo.concat(filesInfoEvent[0]));
          onChange(value.concat(newValue[0]));
        } else {
          setFilesInfo(filesInfoEvent);
          onChange(newValue[0]);
        }
      });
    },
    [multiple, value, filesInfo, onChange],
  );

  const disabledColour =
    disabled || readonly
      ? "text-dark-grey-bg-color"
      : "text-bc-gov-links-color";

  /*   File input styling options are limited so we are attaching a ref to it, hiding it and triggering it with a styled button. */
  return (
    <div className="py-4 flex">
      <button
        type="button"
        onClick={handleClick}
        className={`p-0 decoration-solid border-0 text-lg bg-transparent cursor-pointer underline ${disabledColour}`}
      >
        Upload attachment
      </button>
      <input
        name={id}
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
        type="file"
        required={required}
        className="hidden"
        disabled={disabled || readonly}
        value=""
        accept={options.accept ? String(options.accept) : undefined}
      />
      {value ? (
        <FilesInfo filesInfo={filesInfo} preview={options.filePreview} />
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default FileWidget;
