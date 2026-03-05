// 🛠️ Function to update the report_verification_visits property for POST to the API
export function mergeVerificationData(formData: any): void {
  // Initialize the report_verification_visits array
  formData.report_verification_visits = [];

  // Check if "None" is selected in visit_names
  if (formData.visit_names.includes("None")) {
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

  // Handle visit_types and visit_others, filtering out empty visit_names during mapping
  const visits = [
    ...formData.visit_types.map((type: any) => ({
      visit_name: type.visit_name || "",
      visit_type: type.visit_type || "",
      is_other_visit: false,
      visit_coordinates: "", // Default for non-other visits
    })),
    ...formData.visit_others
      .map((other: any) => ({
        visit_name: other.visit_name || "",
        visit_type: other.visit_type || "",
        is_other_visit: true,
        visit_coordinates: other.visit_coordinates || "",
      }))
      .filter((other: any) => other.visit_name !== ""), // Filter out items with empty visit_name
  ];

  // Assign the filtered visits to the report_verification_visits array
  formData.report_verification_visits = visits.filter((visit: any) => {
    return (
      visit.visit_name !== "" || // Remove empty visit_name
      visit.visit_type !== "" || // Remove empty visit_type
      visit.visit_coordinates !== "" || // Remove empty visit_coordinates
      visit.is_other_visit !== false // Remove false is_other_visit
    );
  });
}
