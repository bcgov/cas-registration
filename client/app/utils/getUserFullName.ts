import { Session } from "next-auth";

export const getUserFullName = (session?: Session | null) => {
  const user = session?.user as { full_name?: string; given_name?: string; family_name?: string; name?: string } | undefined;
  const fullName = user?.full_name;
  const givenName = user?.given_name;
  const familyName = user?.family_name;
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
    userFullName = user?.name || "";
  }

  return userFullName;
};
