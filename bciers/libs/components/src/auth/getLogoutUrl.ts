import { getEnvValue } from "@bciers/actions";

const getLogoutUrl = async () => {
  const logoutUrl = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
  return logoutUrl;
};

export default getLogoutUrl;
