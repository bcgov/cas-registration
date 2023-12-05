import { signOut } from "next-auth/react";
// 🛠️ Function for keycloak session logout
export async function keycloakSessionLogOut() {
  try {
    // call keycloak
    const response = await fetch(`/api/auth/logout`, { method: "GET" });
    if (!response.ok) {
      // redirect to keycloak basic logout SSO page
      window.open(process.env.NEXT_PUBLIC_KEYCLOAK_LOGOUT_URL, "_blank");
    }
    // call nextauth logout
    signOut();
  } catch (err) {
    console.error(err);
  }
}
