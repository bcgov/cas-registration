"use client";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";

const Report = () => {
  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Annual Report Section 2",
    "Sign-off & Submit",
  ];

  return (
    <div className="container mx-auto p-4">
      <MultiStepHeader stepIndex={1} steps={customStepNames} />
    </div>
  );
};

export default Report;
