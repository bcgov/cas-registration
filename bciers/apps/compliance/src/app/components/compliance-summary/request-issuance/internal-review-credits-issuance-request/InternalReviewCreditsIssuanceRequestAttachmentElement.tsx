import { ChangeEvent, MutableRefObject, useRef, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Link,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AttachmentElementProps {
  fileName?: string;
  fileId?: string;
  title: string;
  onFileChange: (file: File | undefined) => void;
  isUploading?: boolean;
}

const AttachmentElement: React.FC<AttachmentElementProps> = ({
  fileName,
  fileId,
  title,
  onFileChange,
  isUploading,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;
  const [uploadedFile, setUploadedFile] = useState<File | undefined>();

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();

    if (fileId && !uploadedFile) {
      // For existing files with an ID, we need to fetch from the server
      // TBD: Backend file download implementation
      // try {
      //   const downloadUrl = `/api/compliance/request-issuance/attachments/${fileId}/download`;
      //   window.open(downloadUrl, '_blank');
      // } catch (error) {
      //   throw new Error(`Error submitting form:, ${error}`);
      // }
    } else if (fileName && uploadedFile) {
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
    <Box className="flex gap-[150px] mt-6">
      <Typography
        variant="body1"
        component="label"
        className="text-[16px] font-normal mb-[8px]"
      >
        {title}
      </Typography>
      <Box className="flex items-center">
        {fileName ? (
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
              className="ml-1 border-none text-[16px] text-bc-bg-blue font-normal cursor-pointer bg-transparent p-0"
              aria-label="Remove file"
            >
              <CloseIcon fontSize="small" />
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
