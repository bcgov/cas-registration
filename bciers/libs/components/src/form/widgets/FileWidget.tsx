import { actionHandler } from "@bciers/actions";
import { AlertIcon } from "@bciers/components/icons";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { TranslatableString, WidgetProps } from "@rjsf/utils";
import { useRef } from "react";

const MAX_FILE_SIZE = 20000000;
type FileScanStatus = "Unscanned" | "Clean" | "Quarantined";

// Show a different message depending on the fileScanStatus
const showScanStatus = (status: FileScanStatus | undefined | null) => {
  if (status === "Quarantined") {
    return (
      <div className="flex items-center justify-between text-red-500 text-sm">
        <AlertIcon />
        <span className="ml-2">
          Security risk found. Check for malware or upload a different file.
        </span>
      </div>
    );
  }
  if (status === "Unscanned") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span>
            Uploading. You may continue to the next page while the file is being
            scanned for security.
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const useFileUploadWidget = (
  endpoint: string,
  method: "PUT" | "PATCH" | "POST",
  pathToRevalidate?: string,
): [typeof formContext, typeof submitWithFiles] => {
  const files: Record<string, File> = {};

  const formContext = {
    onFileSelected: (file: File, propName: string) => {
      files[propName] = file;
    },
  };

  // Proxy for the actionHandler, using a multipart/form-data encoding instead
  const submitWithFiles = async (formData: any) => {
    const formDataWithFiles = new FormData();

    formDataWithFiles.append("payload", JSON.stringify(formData));

    for (const [propName, file] of Object.entries(files)) {
      formDataWithFiles.append(propName, file);
    }

    return await actionHandler(endpoint, method, pathToRevalidate, {
      body: formDataWithFiles,
    });
  };

  return [formContext, submitWithFiles];
};

export function FileElement({
  value,
  preview,
}: {
  readonly value: {
    id: number;
    name: string;
    status?: FileScanStatus;
  };
  readonly preview?: boolean;
}) {
  const handlePreview = () => {
    // Similarly to the report attachments, we'll call the backend
    // to fetch a temporary URL for the file in GCS, and open it in a new tab
  };

  return (
    <ul className="m-0 py-0 flex flex-col justify-start list-none">
      <li data-name={value.name}>
        {JSON.stringify(value)} {showScanStatus(value.status) || value.name}{" "}
        {preview && value.status !== "Quarantined" && (
          <button className="button-link file-download" onClick={handlePreview}>
            {TranslatableString.PreviewLabel}
          </button>
        )}
      </li>
    </ul>
  );
}

const FileWidget: React.FC<WidgetProps> = (props) => {
  const {
    id,
    required,
    disabled,
    readonly,
    options,
    onChange,
    name,
    registry,
    value,
  } = props;

  if (!registry.formContext?.onFileSelected) {
    throw new Error(
      "FileWidget is being used without the useFileUploadWidget context. File uploads will not work.",
    );
  }

  const role = useSessionRole();
  const isCasInternal = role?.includes("cas") && !role?.includes("pending");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 20MB");
        return;
      }
      registry.formContext.onFileSelected(file, name);
    }

    // From the RJSF perspective this will just be a string with the file name.
    onChange(file?.name);
  };

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const uploadLabel = options.uploadLabel
    ? String(options.uploadLabel)
    : "Upload attachment";
  const reuploadLabel = options.reuploadLabel
    ? String(options.reuploadLabel)
    : "Reupload attachment";

  const disabledColour =
    disabled || readonly ? "text-bc-bg-dark-grey" : "text-bc-link-blue";

  return (
    <div className="py-4 flex flex-col md:flex-row items-start gap-2 md:gap-4">
      {!isCasInternal && (
        <button
          type="button"
          onClick={handleClick}
          className={`p-0 decoration-solid border-0 text-base md:text-lg bg-transparent cursor-pointer underline flex-shrink-0 ${disabledColour}`}
          style={{ whiteSpace: "nowrap" }}
        >
          {value ? reuploadLabel : uploadLabel}
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
      {value ? (
        <FileElement value={value} preview={options.filePreview} />
      ) : (
        <span className="text-base md:text-lg flex-shrink-0">
          No attachment was uploaded.
        </span>
      )}
    </div>
  );
};

export { FileWidget as default, useFileUploadWidget };
