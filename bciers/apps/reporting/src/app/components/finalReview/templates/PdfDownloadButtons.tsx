import DownloadPdfButton, {
  Props,
} from "@bciers/components/downloadPDFButton/DownloadPdfButton";

export const LfoDownloadPdfButton: React.FC<Props> = (props) => (
  <DownloadPdfButton
    description={
      <>
        To save facility reports, scroll to{" "}
        <a href="#facility-reports">report information</a>, click view details
        on each report and then click Save as PDF.
      </>
    }
    {...props}
  />
);
export const SfoDownloadPdfButton = DownloadPdfButton;
