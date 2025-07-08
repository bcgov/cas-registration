import * as Sentry from "@sentry/nextjs";
import { getEnvValue } from "@bciers/actions";

const getLogoutUrl = async () => {
  const logoutUrl = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
  if (!logoutUrl) {
    Sentry.captureException("Failed to fetch logout URL");
    console.error("Failed to fetch logout URL");
  }
  return logoutUrl;
};

export default getLogoutUrl;
