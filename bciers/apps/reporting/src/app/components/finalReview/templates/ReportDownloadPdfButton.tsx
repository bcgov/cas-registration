import DownloadPdfButton from "@bciers/components/downloadPDFButton/DownloadPdfButton";

interface Props {
  variant?: "LFO" | "SFO";
}

export const ReportDownloadPdfButton: React.FC<Props> = ({ variant }) => {
  const props =
    variant === "LFO"
      ? {
          description: (
            <>
              To save facility reports, scroll to{" "}
              <a href="#facility-reports">report information</a>, click view
              details on each report and then click Save as PDF.
            </>
          ),
        }
      : {};

  return <DownloadPdfButton {...props} />;
};
