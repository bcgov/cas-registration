// 🛠️ Function to extend the data with additional properties for the rjsf schema
export function extendVerificationData(initialData: any) {
  // Ensure report_verification_visits is always an array
  const visits = initialData.report_verification_visits || [];

  // Add the visit_names property
  initialData.visit_names = visits
    .filter((visit: { is_other_visit: boolean }) => !visit.is_other_visit)
    .map((visit: { visit_name: string }) => visit.visit_name);

  if (
    visits.some((visit: { is_other_visit: boolean }) => visit.is_other_visit)
  ) {
    initialData.visit_names.push("Other");
  }

  // Add the visit_types property
  initialData.visit_types = visits
    .filter(
      (visit: { is_other_visit: boolean; visit_name: string }) =>
        !visit.is_other_visit && visit.visit_name !== "None",
    )
    .map((visit: { visit_name: string; visit_type: string }) => ({
      visit_name: visit.visit_name,
      visit_type: visit.visit_type,
    }));

  // Add the visit_others property
  initialData.visit_others = visits.some(
    (visit: { is_other_visit: boolean }) => visit.is_other_visit,
  )
    ? visits
        .filter((visit: { is_other_visit: boolean }) => visit.is_other_visit)
        .map(
          (visit: {
            visit_name: string;
            visit_coordinates: string;
            visit_type: string;
          }) => ({
            visit_name: visit.visit_name,
            visit_coordinates: visit.visit_coordinates,
            visit_type: visit.visit_type,
          }),
        )
    : [{}];

  return initialData;
}
