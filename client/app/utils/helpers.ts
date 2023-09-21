/**
 * Parses an email address to extract user information.
 * This function is used in a mock authentication demo to extract the user's first name,
 * last name, and domain from an email address.
 * @param {string} email - The user's email address.
 * @returns {{ firstName: string; lastName: string; domain: string; }} An object containing
 * user information: first name, last name, and domain.
 */
export function parseEmail(email: string): {
  firstName: string;
  lastName: string;
  domain: string;
} {
  // Split the email address by "@" to separate the local part from the domain
  const [localPart, domain] = email.split("@");

  // Split the local part by "." to separate potential first and last names
  const names = localPart.split(".");

  let firstName = "";
  let lastName = "";

  // Check the number of name parts and assign them accordingly
  if (names.length === 2) {
    // If there are two parts, assume the first part is the first name
    firstName = names[0];
    // Assume the second part is the last name
    lastName = names[1];
  } else if (names.length === 1) {
    // If there is only one part, assume it's the first name
    firstName = names[0];
  }

  return { firstName, lastName, domain };
}
