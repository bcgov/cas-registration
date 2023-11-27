export interface Operator {
  id: number;
  legal_name: string;
  trade_name: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
  business_structure: string;
  physical_street_address: string;
  physical_municipality: string;
  physical_province: string;
  physical_postal_code: string;
  mailing_street_address: string;
  mailing_municipality: string;
  mailing_province: string;
  mailing_postal_code: string;
  website: string;
  documents: Array<number>;
  contacts: Array<number>;
}

export interface BusinessStructure {
  name: string;
}
