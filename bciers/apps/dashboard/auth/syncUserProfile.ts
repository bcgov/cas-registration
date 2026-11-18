import { actionHandler } from "@bciers/actions";

export const LOGIN_SYNC_ENDPOINT = "registration/user/user-profile/login-sync";

interface StoredProfile {
  email?: string | null;
  bceid_business_name?: string | null;
}

interface IdpProfile {
  email?: string | null;
  bceid_business_name?: string | null;
}

const normalize = (value?: string | null) => (value ?? "").trim();

/**
 * Keeps the identity-provider-owned fields of an existing industry user (email, BCeID business name)
 * in sync with their BCeID profile. Users can change these in the BCeID portal but not in BCIERS.
 *
 * Only calls the API when the user already exists and at least one non-empty value differs, so a normal
 * login makes no extra request. A failed sync must not block the user from logging in.
 */
export async function syncUserProfileOnLogin(
  userGuid: string | undefined,
  storedProfile: StoredProfile | undefined | null,
  idpProfile: IdpProfile,
): Promise<void> {
  // the user doesn't exist yet (first login) - the profile is created from the session on the profile page
  if (!userGuid || !storedProfile || Object.keys(storedProfile).length === 0)
    return;

  const email = normalize(idpProfile.email);
  const businessName = normalize(idpProfile.bceid_business_name);

  const hasChanges =
    (email && email !== normalize(storedProfile.email)) ||
    (businessName &&
      businessName !== normalize(storedProfile.bceid_business_name));
  if (!hasChanges) return;

  await actionHandler(`${LOGIN_SYNC_ENDPOINT}/${userGuid}`, "PUT", undefined, {
    body: JSON.stringify({
      email: email || storedProfile.email,
      bceid_business_name: businessName || storedProfile.bceid_business_name,
    }),
  });
}
