import { EmissionAllocationData, Product } from "../types";

export interface FormData {
  report_product_emission_allocations: EmissionAllocationData[];
  basic_emission_allocation_data: EmissionAllocationData[];
  fuel_excluded_emission_allocation_data: EmissionAllocationData[];
  report_product_emission_allocation_totals: Product[];
  facility_total_emissions: number;
  allocation_methodology: string;
  allocation_other_methodology_description: string;
}
