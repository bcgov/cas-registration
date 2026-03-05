import { FormData } from "../FacilityEmissionAllocationForm";

const errorMethodology =
  "A methodology must be selected before saving and continuing";
const errorMethodologyOther =
  "A description must be provided for the selected methodology";

const validateMethodology = (formData: FormData): string[] => {
  const methodologyIsValid =
    formData.allocation_methodology !== undefined &&
    formData.allocation_methodology !== "";
  return methodologyIsValid ? [] : [errorMethodology];
};

const validateMethodologyOther = (formData: FormData): string[] => {
  const methodologyOtherIsValid =
    formData.allocation_methodology !== "Other"
      ? true
      : formData.allocation_other_methodology_description !== undefined &&
        formData.allocation_other_methodology_description !== "";

  return methodologyOtherIsValid ? [] : [errorMethodologyOther];
};

export { validateMethodology, validateMethodologyOther };
