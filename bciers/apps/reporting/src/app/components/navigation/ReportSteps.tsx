import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";

interface Props {
  stepIndex?: number;
}

const customStepNames = [
  "Operation Information",
  "Facilities Information",
  "Compliance Summary",
  "Sign-off & Submit",
];

const ReportSteps: React.FC<Props> = ({ stepIndex = 0 }) => {
  return (
    <div className="container mx-auto p-4">
      <MultiStepHeader stepIndex={stepIndex} steps={customStepNames} />
    </div>
  );
};

export default ReportSteps;
