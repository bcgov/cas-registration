"use client";

import { ChangeEvent, MutableRefObject, useRef, useState } from "react";
import { WidgetProps } from "@rjsf/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const handleValue = (value: string | File) => {
  let extractedFileName: string = "";
  let downloadUrl: string = "";

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

const FileWidget = ({
  id,
  disabled,
  readonly,
  required,
  onChange,
  value,
  options,
}: WidgetProps) => {
  const { downloadUrl, extractedFileName } = handleValue(value);
  const [fileName, setFileName] = useState(extractedFileName);

  const { data: session } = useSession();
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

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
      // using file.name instead of something from the response because 1) don't want to add useEffect, 2) we don't store filename separately from file in db and I don't want to retrieve the whole thing
      setFileName(file.name);
    }
  };

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
            <Link
              download={fileName}
              href={downloadUrl}
              className="file-download"
              target="_blank"
            >
              {fileName}
            </Link>
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default FileWidget;
