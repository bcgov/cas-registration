import { ChangeEvent, MutableRefObject, useRef, useState } from "react";

interface Props {
  value?: string;
  accept?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
}

const AttachmentElement: React.FC<Props> = ({
  value,
  accept = "application/pdf",
  title,
  onFileChange,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;
  const [currentValue, setCurrentValue] = useState(value);
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
            <a download={`preview`} href={"#"} className="file-download">
              {currentValue}
            </a>
          </li>
        </ul>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded</span>
      )}
    </div>
  );
};

export default AttachmentElement;
