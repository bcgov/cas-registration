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
    // make the widget handle file separately from rest of form data. Widget takes away everything file-related from rjsf (rjsf just sends a filename that we ignore or something, widget intercepts the file object). User might have expectation that file is uploaded right away, not a problem? Other expectation is that submit doesn't take forever. We should upload file on widget, file gets linked to form when we hit submit. Widget would block submission if file not uploaded. Could do a progress bar, configure widget however we like. Stick reporting's attachment element into widget (ish), how to get this to play nice with rjsf/ui schema TBD. Diasble form submission if widget is in progress of uploading stuff. Could tie to form validation.
    // brianna here we're going from a file to a dataurl, which we then have to come back from in the ninja schema
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
      {/* brianna is this just a link */}
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

export const extractFileInfo = (dataURLs: string[]): FileInfoType[] => {
  return dataURLs
    .filter((dataURL) => dataURL)
    .map((dataURL) => {
      // brianna
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
      // brianna if this is happening onchange how much is it affecting silk?
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
  console.log("value", value);
  console.log("localvalue", localValue);
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
