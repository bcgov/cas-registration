import AlertIcon from "@bciers/components/icons/AlertIcon";
import { ChangeEvent, MutableRefObject, useRef } from "react";
import getAttachmentFileUrl from "../../utils/getAttachmentFileUrl";
import { CircularProgress } from "@mui/material";

interface Props {
  versionId: number;
  fileName?: string;
  fileId?: number;
  accept?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
  error?: string;
  required?: boolean;
  isUploading?: boolean;
}

export type AttachmentElementOptions = {
  [key in keyof Partial<Props>]: Props[key];
};

const AttachmentElement: React.FC<Props> = ({
  versionId,
  fileName,
  fileId,
  accept = "application/pdf",
  title,
  onFileChange,
  error,
  required,
  isUploading,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // This should not happen in a regular scenario
    if (!fileId) throw new Error("Unable to download a file without an id.");

    const response = await getAttachmentFileUrl(versionId, fileId);

    // 'download' attribute is not available for an external URL like our storage API
    const anchorTag = document.createElement("a");
    Object.assign(anchorTag, {
      target: "_blank",
      rel: "noopener noreferrer",
      href: response,
    });
    anchorTag.click();
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files) {
      onFileChange(undefined);
      return;
    }

    if (evt.target.files.length > 0) {
      const file = evt.target.files[0];
      onFileChange(file);
    }
  };

  return (
    <div className="py-4 pl-8 flex items-center">
      <p className="mr-8 my-2 w-64">
        <b>
          {title}
          {required && "*"}
        </b>
      </p>
      <button
        type="button"
        onClick={handleClick}
        className={`p-0 decoration-solid border-0 text-lg bg-transparent cursor-pointer underline`}
      >
        {fileName ? "Reupload attachment" : "Upload attachment"}
      </button>

      <input
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
        type="file"
        className="hidden"
        value=""
        accept={accept}
        data-testid="attachment-file-picker"
      />
      {fileName ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            {fileId && (
              <a
                download={fileName}
                href={"#"}
                className="file-download"
                onClick={handleDownload}
              >
                {fileName}
              </a>
            )}
            {!fileId && (
              <>
                {fileName}
                <span className="ml-3">
                  -{" "}
                  {isUploading ? (
                    <>
                      uploading
                      <CircularProgress
                        data-testid="progressbar"
                        role="progressContinuing"
                        size={18}
                        className="ml-3"
                      />
                    </>
                  ) : (
                    "will upload on save"
                  )}
                </span>
              </>
            )}
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
      {error !== undefined && (
        <div
          className="w-full md:w-4/12 flex items-center text-red-600 ml-0 md:ml-4"
          role="alert"
        >
          <div className="hidden md:block mr-3">
            <AlertIcon />
          </div>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AttachmentElement;
