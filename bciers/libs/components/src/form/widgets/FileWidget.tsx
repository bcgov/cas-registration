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
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// make the widget handle file separately from rest of form data. Widget takes away everything file-related from rjsf (rjsf just sends a filename that we ignore or something, widget intercepts the file object). User might have expectation that file is uploaded right away, not a problem? Other expectation is that submit doesn't take forever. We should upload file on widget, file gets linked to form when we hit submit. Widget would block submission if file not uploaded. Could do a progress bar, configure widget however we like. Stick reporting's attachment element into widget (ish), how to get this to play nice with rjsf/ui schema TBD. Diasble form submission if widget is in progress of uploading stuff. Could tie to form validation.
// file here we're going from a file to a dataurl, which we then have to come back from in the ninja schema

function addNameToDataURL(dataURL: string, name: string) {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(";base64", `;name=${encodeURIComponent(name)};base64`);
}

function convertToDataUri(file: File): Promise<string | null> {
  const { name } = file;
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        resolve(addNameToDataURL(event.target.result, name));
      } else {
        resolve(null);
      }
    };
    reader.readAsDataURL(file);
  });
}

export const handleValue = (value: string | File) => {
  let extractedFileName: string = "";
  let downloadUrl: string | undefined = undefined;

  if (typeof value === "string") {
    downloadUrl = value;
    const match = value.match(/\/documents\/([^?]+)/);
    extractedFileName = match ? match[1] : "";
  }

  if (value instanceof File) {
    extractedFileName = value.name;
    downloadUrl = URL.createObjectURL(value);
  }

  return { downloadUrl, extractedFileName };
};

// Custom hook to handle the value
// const useHandleValue = (value: string | File) => {
//   const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
//   const [extractedFileName, setExtractedFileName] = useState<string>("");

//   useEffect(() => {
//     const handleAsyncValue = async () => {
//       const { downloadUrl, extractedFileName } = await handleValue(value);
//       setDownloadUrl(downloadUrl);
//       setExtractedFileName(extractedFileName);
//     };

//     handleAsyncValue(); // Trigger the async function
//   }, [value]); // Re-run when `value` changes

//   return { downloadUrl, extractedFileName };
// };

const FileWidget = ({
  id,
  disabled,
  readonly,
  required,
  multiple,
  label,
  onChange,
  value,
  options,
  registry,
  formContext,
}: WidgetProps) => {
  // operationId can be undefined we're creating a new operation
  // const operationId = formContext?.operationId;
  const [isUploading, setIsUploading] = useState(false);
  // brianna initial state will need to be the get file
  // const [file, setFile] = useState<File | undefined>(undefined);

  const { downloadUrl, extractedFileName } = handleValue(value);
  console.log("extractedFileName", extractedFileName);
  console.log("downloadUrl", downloadUrl);

  const [fileName, setFileName] = useState(extractedFileName);
  const [url, setUrl] = useState(downloadUrl);
  console.log("filename", fileName);
  console.log("value in filewidget", value);
  console.log("extractedFileName", extractedFileName);
  // const [oldFileId, setOldFileId] = useState(value);

  const { data: session } = useSession();
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  async function postDocuments(fileData: FormData) {
    const endpoint = `registration/documents`;

    const response = await actionHandler(endpoint, "POST", "", {
      body: fileData,
    });

    return response;
  }

  // /operations/{uuid:operation_id}/documents/{uuid:document_type}

  const handleChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files) {
      return;
    }
    if (evt.target.files.length > 0) {
      const file = evt.target.files[0];
      const maxSize = 20000000;
      if (file.size > maxSize) {
        alert("File size must be less than 20MB");
        return;
      }

      onChange(file);
      // using file.name instead of something from the response because 1) don't want to add useEffect, 2) we don't store filename separrately from file in db and I don't want to retrieve the whole thing
      setFileName(file.name);
    }
  };

  const disabledColour =
    disabled || readonly ? "text-bc-bg-dark-grey" : "text-bc-link-blue";

  if (isUploading) {
    return <div>Loading...</div>;
  }
  /*   File input styling options are limited so we are attaching a ref to it, hiding it and triggering it with a styled button. */
  return (
    <div className="py-4 flex">
      {!isCasInternal && (
        <button
          type="button"
          onClick={handleClick}
          className={`p-0 decoration-solid border-0 text-lg bg-transparent cursor-pointer underline ${disabledColour}`}
        >
          {fileName ? "Reupload attachment" : "Upload attachment"}
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
      {fileName ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            {/* brianna gotta make this work, I think we need to use dataurl for before it's uploaded */}
            <a
              download={fileName}
              href={downloadUrl}
              className="file-download"
              target="_blank"
            >
              {fileName}
            </a>
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default FileWidget;
