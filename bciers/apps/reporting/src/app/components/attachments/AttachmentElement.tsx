import { ChangeEvent, MutableRefObject, useRef, useState } from "react";
import { UploadedAttachment } from "./types";

interface Props {
  uploadedAttachment?: UploadedAttachment;
  accept?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
}

const AttachmentElement: React.FC<Props> = ({
  uploadedAttachment,
  accept = "application/pdf",
  title,
  onFileChange,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;
  const [currentValue, setCurrentValue] = useState(
    uploadedAttachment?.file_name,
  );
  const [currentFile, setCurrentFile] = useState<File>();

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files) {
      setCurrentFile(undefined);
      setCurrentValue(undefined);
      onFileChange(undefined);
      return;
    }

    if (evt.target.files.length > 0) {
      const file = evt.target.files[0];
      setCurrentFile(file);
      setCurrentValue(file.name);
      onFileChange(file);
    }
  };

  return (
    <div className="py-4 pl-8 flex items-center">
      <p className="mr-8 my-2 w-64">
        <b>{title}</b>
      </p>
      <button
        type="button"
        onClick={handleClick}
        className={`p-0 decoration-solid border-0 text-lg bg-transparent cursor-pointer underline`}
      >
        {currentValue ? "Reupload attachment" : "Upload attachment"}
      </button>

      <input
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
        type="file"
        className="hidden"
        value=""
        accept={accept}
      />
      {currentFile || currentValue ? (
        <ul className="m-0 py-0 flex flex-col justify-start">
          <li>
            <a download={currentValue} href={"#"} className="file-download">
              {currentValue}
            </a>
            {currentFile && <span className="ml-3">- will upload on save</span>}
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default AttachmentElement;
