// Check if a product has a real value for jan_mar_production
// Display driven by actual data presence
export const hasJanMarProduction = (formData?: any) =>
  formData?.products?.some((p: any) => p?.jan_mar_production != null) ?? false;

export const janMarSchemaField = {
  jan_mar_production: {
    type: "number" as const,
    title: "Production data for Jan 1 - Mar 31 2025",
  },
};
export const janMarUiSchemaField = {
  jan_mar_production: {
    "ui:options": {
      displayUnit: "production unit",
    },
  },
};
