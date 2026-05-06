"use client";

import downloadAttachment from "./download";

interface Props {
  versionId: number;
  fileName?: string;
  fileId?: number;
  title: string;
}

const ReadOnlyAttachmentElement: React.FC<Props> = ({
  versionId,
  fileName,
  fileId,
  title,
}) => {
  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadAttachment(versionId, fileId);
  };

  return (
    <div className="py-4 flex items-center">
      <p className="mr-8 my-2 w-64">
        <b>{title}</b>
      </p>
      {fileName ? (
        <span className="ml-4">
          {fileId ? (
            <button className="button-link" onClick={handleDownload}>
              {fileName}
            </button>
          ) : (
            fileName
          )}
        </span>
      ) : (
        <span className="ml-4 text-lg">No attachment was uploaded.</span>
      )}
    </div>
  );
};

export default ReadOnlyAttachmentElement;
