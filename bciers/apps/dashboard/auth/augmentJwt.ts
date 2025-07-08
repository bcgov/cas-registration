import type { DefaultSession, NextAuthConfig } from "next-auth";
import Keycloak, { KeycloakProfile } from "next-auth/providers/keycloak";
import { Errors, IDP } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
export const augmentJwt = async (token, account, profile, trigger) => {
  try {
    // 🧩 custom properties are configured through module augmentation
    if (profile) {
      token.given_name = (profile as KeycloakProfile).given_name;
      token.family_name = (profile as KeycloakProfile).family_name;
      token.bceid_business_name = (
        profile as KeycloakProfile
      ).bceid_business_name;
      token.bceid_business_guid = (
        profile as KeycloakProfile
      ).bceid_business_guid;
    }
    //📌  Provider account (only available on sign in)
    if (account) {
      // ✨  On a new sessions, you can add information to the next-auth created token...

      // 👇️ used for routing and DJANGO API calls
      token.user_guid = account.providerAccountId.split("@")[0];

      token.identity_provider = account.providerAccountId.split("@")[1];
    }
    if (!token.full_name) {
      // 🚀 API call: Get user name from user table
      const response = await actionHandler(
        `registration/user/user-profile/${token.user_guid}`,
        "GET",
      );
      const { first_name: firstName, last_name: lastName } = response || {};
      if (firstName && lastName) {
        token.full_name = `${firstName} ${lastName}`;
      } else {
        token.full_name = `${token.given_name} ${token.family_name}`;
      }
    }
    // Check if app_role is missing or if the update trigger was called
    if (!token.app_role || trigger === "update") {
      console.log("-----------------------------------");
      // Augment the keycloak token with the user app_role
      // 🚀 API call: Get user app_role by user_guid from user table

      const responseRole = await actionHandler(
        `registration/user/user-app-role/${token.user_guid}`,
        "GET",
      );
      console.log("-----------------------responseRole", responseRole);
      // If the user is found in the table,
      if (responseRole?.role_name) {
        // user found in table, assign role to token (note: all industry users have the same app role of `industry_user`, and their permissions are further defined by their role in the UserOperator model)
        token.app_role = responseRole.role_name;
        //for bceid users, augment with admin based on operator-user table
        if (token.identity_provider === IDP.BCEIDBUSINESS) {
          try {
            // 🚀 API call: check if user is admin approved
            const responseAdmin = await actionHandler(
              `registration/user-operators/current/is-current-user-approved-admin/${token.user_guid}`,
              "GET",
            );
            debugger;
            if (responseAdmin?.approved) {
              console.log(
                "-----------------------responseAdmin",
                responseAdmin,
              );
              token.app_role = "industry_user_admin"; // note: industry_user_admin a front-end only role. In the db, all industry users have an industry_user app_role, and their permissions are further defined by UserOperator.role
            } else {
              // Default app_role (industry_user) if the API call fails
            }
          } catch (error) {
            // Default app_role (industry_user) if there's an error in the API call
          }
        }
      } else {
        // 🛸 Routing: no app_role user found; so, user will be routed to dashboard\profile
      }
    }
  } catch (error) {
    token.error = Errors.ACCESS_TOKEN;
  }
  // 🔒 return encrypted nextauth JWT
  console.log("-----------------------token", token);
  return token;
};
