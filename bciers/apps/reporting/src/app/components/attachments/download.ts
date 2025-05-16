import getAttachmentFileUrl from "@reporting/src/app/utils/getAttachmentFileUrl";

export default async function downloadAttachment(
  versionId: number,
  attachmentId: number | undefined,
) {
  // This should not happen in a regular scenario
  if (!attachmentId)
    throw new Error("Unable to download a file without an id.");

  const response = await getAttachmentFileUrl(versionId, attachmentId);

  // 'download' attribute is not available for an external URL like our storage API
  const anchorTag = document.createElement("a");
  Object.assign(anchorTag, {
    target: "_blank",
    rel: "noopener noreferrer",
    href: response,
    // Browsers will ignore the download attribute since the URL is not from the same origin
  });
  anchorTag.click();
}
