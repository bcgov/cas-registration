export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  position_title: string;
  email: string;
  phone_number: string;
  app_role?: { role_name: string };
}

export interface UserProfilePartialFormData {
  first_name?: string;
  last_name?: string;
  position_title?: string;
  email?: string;
  phone_number?: string;
  app_role?: { role_name: string };
}
