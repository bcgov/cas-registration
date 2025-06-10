import { ChangeEvent, MutableRefObject, useRef } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Button,
  Link,
  IconButton,
  List,
  ListItem,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { AlertIcon } from "@bciers/components/icons";

interface AttachmentsElementProps {
  title: string;
  onRemoveFile: (index: number) => void;
  onAddFiles: (files: File[]) => void;
  isUploading?: boolean;
  error?: string | null;
  uploadedFiles: File[];
}

const AttachmentsElement: React.FC<AttachmentsElementProps> = ({
  title,
  onRemoveFile,
  onAddFiles,
  isUploading,
  error,
  uploadedFiles,
}) => {
  const hiddenFileInput = useRef() as MutableRefObject<HTMLInputElement>;

  const handlePreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
    setTimeout(() => URL.revokeObjectURL(fileURL), 100);
  };

  const handleFileSelection = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files?.length) return;
    onAddFiles(Array.from(evt.target.files));
    evt.target.value = "";
  };

  return (
    <Box className="flex mt-6">
      <Typography
        variant="body2"
        component="label"
        className="text-[16px] font-bold mb-2 w-[240px]"
      >
        {title}
      </Typography>
      <Box className="flex flex-col items-start ml-[10px]">
        <input
          ref={hiddenFileInput}
          onChange={handleFileSelection}
          type="file"
          className="hidden"
          multiple
          accept=".pdf"
        />
        {uploadedFiles.length > 0 && (
          <List className="pt-0">
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                className="min-h-[auto] flex items-center w-full"
              >
                <Link
                  href="#"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(file);
                  }}
                  className="text-bc-link-blue leading-none flex-grow"
                >
                  {file.name}
                </Link>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="text-bc-error-red ml-2 p-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}

        {uploadedFiles.length == 0 && (
          <Typography variant="body2" className="text-[16px]">
            No attachments were uploaded
          </Typography>
        )}

        <Button
          variant="text"
          onClick={() => hiddenFileInput.current.click()}
          className="p-0 border-0 text-[16px] bg-transparent cursor-pointer underline text-bc-bg-blue min-w-[auto]"
        >
          Browse
        </Button>

        {isUploading && (
          <Box className="flex items-center mt-2">
            <CircularProgress size={18} className="mr-2" />
            <Typography variant="body2" className="text-[16px]">
              Uploading...
            </Typography>
          </Box>
        )}
        {error && (
          <Box className="flex items-center gap-[8px] mt-2">
            <AlertIcon />
            <Typography
              variant="body2"
              className="text-bc-error-red text-[16px]"
            >
              {error}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AttachmentsElement;
