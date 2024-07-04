import { Session } from "next-auth";

const getUserFullName = (session?: Session | null) => {
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
