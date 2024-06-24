// Define the Session type
type Session = {
  user?: {
    full_name?: string;
    given_name?: string;
    family_name?: string;
    name?: string; // Added this for the fallback case
  };
};

// Define the getUserFullName function with the session parameter typed as Session
export const getUserFullName = (session: Session) => {
  const fullName = session?.user?.full_name;
  const givenName = session?.user?.given_name;
  const familyName = session?.user?.family_name;
  let userFullName;

  if (fullName) {
    userFullName = fullName;
  } else if (givenName && familyName) {
    userFullName = givenName.concat(" ", familyName);
  } else if (givenName && !familyName) {
    userFullName = givenName;
  } else if (!givenName && familyName) {
    userFullName = familyName;
  } else {
    userFullName = session?.user?.name || "";
  }

  return userFullName;
};

export default getUserFullName;
