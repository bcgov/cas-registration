"use client";
interface ComplianceHeadingProps {
  title: string;
  className?: string;
}

export const ComplianceHeading: React.FC<ComplianceHeadingProps> = ({
  title,
  className = "",
}) => {
  return (
    <div
      className={`w-full form-group field field-object form-heading-label ${className}`}
    >
      <div
        className="form-heading"
        style={{ borderTopWidth: "1px", borderBottomWidth: "1px" }}
      >
        {title}
      </div>
    </div>
  );
};

export default ComplianceHeading;
