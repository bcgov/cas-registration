import { actionHandler } from "@bciers/actions";

export const LOGIN_SYNC_ENDPOINT = "registration/user/user-profile/login-sync";

interface BceidLoginProfile {
  email?: string | null;
  bceid_business_name?: string | null;
}

/**
 * Keeps the identity-provider-owned fields of an existing industry user (email, BCeID business name)
 * in sync with their BCeID profile. Users can change these in the BCeID portal but not in BCIERS.
 * The backend decides whether anything changed and needs saving. A failed sync must not block the user from logging in.
 */
export async function syncUserProfileOnLogin(
  userGuid: string | undefined,
  storedProfile: BceidLoginProfile | undefined | null,
  idpProfile: BceidLoginProfile,
): Promise<void> {
  // the user doesn't exist yet (first login) - the profile is created from the session on the profile page
  if (!userGuid || !storedProfile || Object.keys(storedProfile).length === 0)
    return;

  await actionHandler(`${LOGIN_SYNC_ENDPOINT}/${userGuid}`, "PUT", undefined, {
    body: JSON.stringify({
      email: idpProfile.email,
      bceid_business_name: idpProfile.bceid_business_name,
    }),
  });
}
