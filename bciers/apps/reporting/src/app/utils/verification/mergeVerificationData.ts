// 🛠️ Function to update the report_verification_visits property for the API schema
export function mergeVerificationData(formData: any): void {
  // Initialize the report_verification_visits array
  formData.report_verification_visits = [];

  // Check if "None" is selected in visit_names
  if (
    Array.isArray(formData.visit_names) &&
    formData.visit_names.includes("None")
  ) {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
    return; // Exit early as "None" overrides all other data
  } else if (formData.visit_names === "None") {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
    return; // Exit early as "None" overrides all other data
  }

  // Handle visit_types
  if (Array.isArray(formData.visit_types)) {
    formData.report_verification_visits.push(
      ...formData.visit_types.map((type: any) => ({
        visit_name: type.visit_name || "",
        visit_type: type.visit_type || "",
        is_other_visit: false,
        visit_coordinates: "", // Default for non-other visits
      })),
    );
  } else if (formData.visit_types) {
    // Handle single object scenario for visit_types
    formData.report_verification_visits.push({
      visit_name: formData.visit_types.visit_name || "",
      visit_type: formData.visit_types.visit_type || "",
      is_other_visit: false,
      visit_coordinates: "", // Default for non-other visits
    });
  }

  // Handle visit_others
  if (Array.isArray(formData.visit_others)) {
    formData.report_verification_visits.push(
      ...formData.visit_others.map((other: any) => ({
        visit_name: other.visit_name || "",
        visit_type: other.visit_type || "",
        is_other_visit: true,
        visit_coordinates: other.visit_coordinates || "",
      })),
    );
  } else if (formData.visit_others) {
    // Handle single object scenario for visit_others
    formData.report_verification_visits.push({
      visit_name: formData.visit_others.visit_name || "",
      visit_type: formData.visit_others.visit_type || "",
      is_other_visit: true,
      visit_coordinates: formData.visit_others.visit_coordinates || "",
    });
  }

  // If "None" is found in visit_types or visit_others, override with "None"
  const noneSelectedInVisitTypes = Array.isArray(formData.visit_types)
    ? formData.visit_types.some((type: any) => type.visit_name === "None")
    : formData.visit_types?.visit_name === "None";

  const noneSelectedInVisitOthers = Array.isArray(formData.visit_others)
    ? formData.visit_others.some((other: any) => other.visit_name === "None")
    : formData.visit_others?.visit_name === "None";

  if (noneSelectedInVisitTypes || noneSelectedInVisitOthers) {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
  }
}
