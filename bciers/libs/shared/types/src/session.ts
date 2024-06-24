export type Session = {
  user?: {
    full_name?: string;
    given_name?: string;
    family_name?: string;
    name?: string; // Added this for the fallback case
  };
};
