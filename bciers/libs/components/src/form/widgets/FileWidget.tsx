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

const addNameToDataURL = (dataURL: string, name: string) => {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(";base64", `;name=${encodeURIComponent(name)};base64`);
};

// make the widget handle file separately from rest of form data. Widget takes away everything file-related from rjsf (rjsf just sends a filename that we ignore or something, widget intercepts the file object). User might have expectation that file is uploaded right away, not a problem? Other expectation is that submit doesn't take forever. We should upload file on widget, file gets linked to form when we hit submit. Widget would block submission if file not uploaded. Could do a progress bar, configure widget however we like. Stick reporting's attachment element into widget (ish), how to get this to play nice with rjsf/ui schema TBD. Diasble form submission if widget is in progress of uploading stuff. Could tie to form validation.
// brianna here we're going from a file to a dataurl, which we then have to come back from in the ninja schema

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
  // We need to store the value in state to prevent loosing the value when user switches between tabs
  const [brianna, setBrianna] = useState(undefined);

  const { data: session } = useSession();
  const isCasInternal =
    session?.user?.app_role?.includes("cas") &&
    !session?.user?.app_role?.includes("pending");

  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const validateAttachments = () => {
    // if (
    //   isVerificationStatementMandatory &&
    //   !(
    //     "verification_statement" in pendingUploadFiles ||
    //     "verification_statement" in initialUploadedAttachments
    //   )
    // ) {
    //   setValidationErrors({
    //     verification_statement: "Must be present",
    //   });
    //   return false;
    // } else {
    //   setValidationErrors({});
    //   return true;
    // }
    console.log("hit validate");
    return true;
  };

  async function postDocuments(fileData: FormData) {
    const endpoint = `registration/documents`;
    console.log("endpoint", endpoint);
    for (let [key, value] of fileData.entries()) {
      console.log(key, value);
    }
    const response = await actionHandler(endpoint, "POST", "", {
      body: fileData,
    });

    return response;
  }

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
      if (!validateAttachments()) return;

      const formData = new FormData();

      formData.append("file", file);
      formData.append("document_type", label);
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      setIsUploading(true);
      const response = await postDocuments(formData);

      if (response.error) {
        // setError(response.error);
        setIsUploading(false);
      }
      setBrianna(file);
      setIsUploading(false);
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
          {brianna ? "Reupload attachment" : "Upload attachment"}
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
      {brianna ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            {/* how is this download working in reporting */}
            <a download={brianna?.name} href={"#"} className="file-download">
              {brianna.name}
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
