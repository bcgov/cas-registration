"use client";

import {
  ChangeEvent,
  MutableRefObject,
  useCallback,
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

function FilesInfo<
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
    <ul className="m-0 py-0 flex flex-col justify-start">
      {filesInfo.map((fileInfo) => {
        const { name } = fileInfo;
        return (
          <li key={name}>
            {name}
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
  registry,
}: WidgetProps) => {
  const [filesInfo, setFilesInfo] = useState<FileInfoType[]>(
    Array.isArray(value) ? extractFileInfo(value) : extractFileInfo([value]),
  );
  const { data: session } = useSession();
  const isCasInternal =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

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
          {value ? "Reupload attachment" : "Upload attachment"}
        </button>
      )}
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
