import { ChangeEvent, MutableRefObject, useRef, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Link,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { AlertIcon } from "@bciers/components/icons";

interface AttachmentElementProps {
  fileName?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
  isUploading?: boolean;
  error?: string | null;
}

const AttachmentElement: React.FC<AttachmentElementProps> = ({
  fileName,
  title,
  onFileChange,
  isUploading,
  error,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;
  const [uploadedFile, setUploadedFile] = useState<File | undefined>();

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();

    if (fileName && uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      window.open(fileURL, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileURL), 100);
    }
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files) {
      setUploadedFile(undefined);
      onFileChange(undefined);
      return;
    }

    if (evt.target.files.length > 0) {
      const file = evt.target.files[0];
      setUploadedFile(file);
      onFileChange(file);
    }
  };

  return (
    <Box className="flex mt-6">
      <Typography
        variant="body1"
        component="label"
        className="text-[16px] font-bold mb-[8px] w-[240px]"
      >
        {title}
      </Typography>
      <Box className="flex items-center ml-[10px]">
        {uploadedFile ? (
          <Box className="mr-[10px]">
            <Link
              href="#"
              onClick={handleDownload}
              className="text-bc-link-blue underline cursor-pointer"
            >
              {fileName}
            </Link>

            <IconButton
              size="small"
              onClick={() => {
                setUploadedFile(undefined);
                onFileChange(undefined);
              }}
              className="ml-1 border-none text-bc-error-red text-[16px] text-bc-bg-blue font-normal cursor-pointer bg-transparent p-0"
              aria-label="Remove file"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>

            {isUploading && (
              <CircularProgress role="progressContinuing" size={18} />
            )}
          </Box>
        ) : (
          <Typography variant="body1" className="mr-[10px] text-[16px]">
            No attachment was uploaded
          </Typography>
        )}

        <Button
          variant="text"
          onClick={() => hiddenFileInput.current.click()}
          className="p-0 decoration-solid border-0 text-[16px] bg-transparent cursor-pointer underline text-bc-bg-blue"
        >
          Browse
        </Button>
        {error && (
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
        <input
          ref={hiddenFileInput}
          onChange={handleChange}
          style={{ display: "none" }}
          type="file"
          className="hidden"
          value=""
          accept=".pdf"
          role="button"
          aria-label="Upload attachment"
        />
      </Box>
    </Box>
  );
};

export default AttachmentElement;
