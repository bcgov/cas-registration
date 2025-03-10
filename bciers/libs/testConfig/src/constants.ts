export const downloadUrl =
  "https://storage.googleapis.com/test-registration-documents/documents/test.pdf?";
export const downloadUrl2 =
  "https://storage.googleapis.com/test-registration-documents/documents/test2.pdf?";
export const mockFile = new File(["test"], "test.pdf", {
  type: "application/pdf",
});
export const mockFile2 = new File(["test2"], "test2.pdf", {
  type: "application/pdf",
});
export const mockFileUnaccepted = new File(["test"], "test.txt", {
  type: "text/plain",
});

export const mock21MBFile = new File(["test".repeat(20000000)], "test.pdf", {
  type: "application/pdf",
});
