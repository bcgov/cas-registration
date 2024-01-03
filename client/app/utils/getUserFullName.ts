import { Session } from 'next-auth';

export const getUserFullName = (
  session: Session
) => {

  const givenName = session?.user?.given_name;
  const familyName = session?.user?.family_name;
  let userFullName;
  if (givenName && familyName)
    userFullName = givenName.concat(' ', familyName);
  else if (givenName && !familyName)
    userFullName = givenName;
  else if (!givenName && familyName)
    userFullName = familyName;
  else
    userFullName = session?.user?.name || "";

  return userFullName
};
