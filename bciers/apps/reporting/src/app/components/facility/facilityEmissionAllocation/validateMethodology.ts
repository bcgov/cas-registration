import { FormData } from "../FacilityEmissionAllocationForm";

const validateMethodology = (formData: FormData): boolean => {
  return (
    formData.allocation_methodology !== undefined &&
    formData.allocation_methodology !== ""
  );
};

const validateMethodologyOther = (formData: FormData): boolean => {
  return formData.allocation_methodology !== "Other"
    ? true
    : formData.allocation_other_methodology_description !== undefined &&
        formData.allocation_other_methodology_description !== "";
};

export { validateMethodology, validateMethodologyOther };
