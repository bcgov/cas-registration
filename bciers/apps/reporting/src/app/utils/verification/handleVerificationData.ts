// 🛠️ Function to manages interaction with the data and form
// Required(?) when JSON Schema validators struggle with conditional logic based on dynamic enums
// Required(?) when using an array, visit_names, requiring a MultiSelectWidget but with a maxItem rules
export function handleVerificationData(
  updatedData: any,
  operationType: string,
) {
  let selectedValues = updatedData.visit_names;

  if (selectedValues.includes("None")) {
    if (selectedValues.length > 1) {
      // Remove "None" if other selections are made
      updatedData.visit_names = selectedValues.filter(
        (value: string) => value !== "None",
      );
    } else {
      // Lock to "None" and clear other fields
      updatedData.visit_names = ["None"];
      updatedData.visit_types = [];
      updatedData.visit_others = [{}];
      return updatedData;
    }
  }

  if (operationType === "SFO" && selectedValues.length > 1) {
    // Ensure "SFO" can only have one item, taking the last selected
    const lastSelected = selectedValues[selectedValues.length - 1];
    updatedData.visit_names = [lastSelected];

    if (lastSelected === "None") {
      // Clear visit types and visit others only if the value is "None"
      updatedData.visit_types = [];
      updatedData.visit_others = [{}];
    }
  }

  // Update `visit_types` for each facility except "Other" and "None"
  updatedData.visit_types = updatedData.visit_names
    .filter(
      (visit_name: string) => visit_name !== "Other" && visit_name !== "None",
    )
    .map((visit_name: string) => {
      const existingVisitType = updatedData.visit_types?.find(
        (item: { visit_name: string }) => item.visit_name === visit_name,
      );
      return existingVisitType || { visit_name, visit_type: "" };
    });

  return updatedData;
}
