interface ComplianceHeadingProps {
  title: string;
  className?: string;
}

export const ComplianceFormHeading: React.FC<ComplianceHeadingProps> = ({
  title,
  className = "",
}) => {
  return (
      <div className={`form-heading border-y-2 ${className}`}>
        {title}
      </div>
  );
};

export default ComplianceFormHeading;
