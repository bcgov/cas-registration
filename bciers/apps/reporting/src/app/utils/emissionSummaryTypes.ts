export interface EmissionSummaryFormData {
  attributable_for_reporting: string;
  attributable_for_reporting_threshold: string;
  reporting_only_emission: string;
  emission_categories: {
    flaring: string;
    fugitive: string;
    industrial_process: string;
    onsite_transportation: string;
    stationary_combustion: string;
    venting_useful: string;
    venting_non_useful: string;
    waste: string;
    wastewater: string;
  };
  fuel_excluded: {
    woody_biomass: string;
    excluded_biomass: string;
    excluded_non_biomass: string;
  };
  other_excluded: {
    lfo_excluded: string;
    fog_excluded: string; // To be handled once we implement a way to capture FOG emissions
  };
}
