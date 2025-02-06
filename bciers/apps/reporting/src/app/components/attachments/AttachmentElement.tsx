import AlertIcon from "@bciers/components/icons/AlertIcon";
import { ChangeEvent, MutableRefObject, useRef } from "react";

interface Props {
  fileName?: string;
  fileId?: number;
  accept?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
  error?: string;
  required?: boolean;
}

export type AttachmentElementOptions = {
  [key in keyof Partial<Props>]: Props[key];
};

const AttachmentElement: React.FC<Props> = ({
  fileName,
  fileId,
  accept = "application/pdf",
  title,
  onFileChange,
  error,
  required,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handleClick = () => {
    hiddenFileInput.current.click();
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
            <a download={fileName} href={"#"} className="file-download">
              {fileName}
            </a>
            {!fileId && <span className="ml-3">- will upload on save</span>}
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
