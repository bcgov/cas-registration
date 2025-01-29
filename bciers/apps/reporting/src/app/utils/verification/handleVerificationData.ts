export function handleVerificationData(
  updatedData: any,
  operationType: string,
) {
  let selectedValues = updatedData.visit_names;

  if (selectedValues.includes("None")) {
    if (selectedValues.length > 1) {
      // If "None" is the last selected item, clear everything
      if (selectedValues[selectedValues.length - 1] === "None") {
        updatedData.visit_names = ["None"];
        updatedData.visit_types = [];
        updatedData.visit_others = [{}];
        return updatedData;
      } else {
        // Otherwise, remove "None"
        updatedData.visit_names = selectedValues.filter(
          (value: string) => value !== "None",
        );
      }
    } else {
      // If only "None" is selected, lock it and clear other fields
      updatedData.visit_names = ["None"];
      updatedData.visit_types = [];
      updatedData.visit_others = [{}];
      return updatedData;
    }
  }

  if (operationType === "SFO" && selectedValues.length > 1) {
    // Ensure "SFO" visit_names maxItem=1
    const lastSelected = selectedValues[selectedValues.length - 1];

    // Set the last selected item as the only value for visit_names
    updatedData.visit_names = [lastSelected];
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

  // Clear visit_others if "Other" is not selected
  if (!updatedData.visit_names.includes("Other")) {
    updatedData.visit_others = [{}];
  }

  return updatedData;
}
