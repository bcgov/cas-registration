import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";

export async function transformNewEntrantFormData(versionId: number) {
  // Retrieve new entrant data for the provided version_id
  const newEntrantData = await getNewEntrantData(versionId);
  const { new_entrant_data: initialFormData } = newEntrantData;

  // Transform emissions based on the provided naics_code
  function transformEmissions(emissions: any[], naics_code: string) {
    // Filter emissions according to specific conditions
    const filteredEmissions = emissions?.filter((emission) => {
      if (
        emission.category_type === "other_excluded" &&
        naics_code !== "324110"
      ) {
        return false;
      }
      return !(
        naics_code === "324110" &&
        emission.category_type === "other_excluded" &&
        emission.category_name.toLowerCase().includes("fat, oil and grease")
      );
    });

    // Group emissions by their category_type
    const groupedEmissions = filteredEmissions?.reduce(
      (acc, emission) => {
        const categoryType = emission.category_type;
        if (!acc[categoryType]) {
          acc[categoryType] = {
            name: categoryType,
            title:
              categoryType === "basic"
                ? "Emission categories after new entrant period began"
                : categoryType === "fuel_excluded"
                ? "Emissions excluded by fuel type"
                : "Other emissions",
            emissionData: [],
          };
        }
        acc[categoryType].emissionData.push({
          id: emission.id,
          name: emission.category_name,
          emission: emission.emission,
        });
        return acc;
      },
      {} as Record<
        string,
        { name: string; title: string; emissionData: any[] }
      >,
    );

    return Object.values(groupedEmissions);
  }

  // Build the final formData by merging the initial form data with products and transformed emissions
  const formData = {
    ...initialFormData,
    products: newEntrantData.products,
    emissions: transformEmissions(
      newEntrantData.emissions,
      newEntrantData.naics_code,
    ),
  };

  return formData;
}
