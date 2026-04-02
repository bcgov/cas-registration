// Check if a product has a real value for jan_mar_production
// Display driven by actual data presence
export const hasJanMarProduction = (formData?: any) =>
  formData?.products?.some((p: any) => p?.jan_mar_production != null) ?? false;
