import { describe, expect } from "vitest";
import { Session } from "next-auth";
import getUserFullName from "@bciers/utils/getUserFullName";

const session = {
  user: {
    name: "Test User name field",
    email: "test@gov.bc.ca",
    bceid_business_guid: "business-guid-here",
    bceid_business_name: "Cas, Bcgov",
    given_name: "Test",
    family_name: "User",
    full_name: "Test User full_name field",
    app_role: "industry_user_admin",
  },
  expires: "2024-04-18T21:15:11.264Z",
  identity_provider: "bceidbusiness",
} as Session;

describe("getUserFullName function", () => {
  it("returns the full name when it is available", () => {
    const userFullName = getUserFullName(session);
    expect(userFullName).toBe("Test User full_name field");
  });

  it("returns the given_name and family_name fields when the full name is not available", () => {
    const sessionWithoutFullName = {
      ...session,
      user: { ...session.user, full_name: undefined },
    };
    const userFullName = getUserFullName(sessionWithoutFullName);
    expect(userFullName).toBe("Test User");
  });

  it("returns the given_name when the full_name and family_name is not available", () => {
    const sessionWithoutFamilyName = {
      ...session,
      user: { ...session.user, family_name: undefined, full_name: undefined },
    };
    const userFullName = getUserFullName(sessionWithoutFamilyName);

    expect(userFullName).toBe("Test");
  });

  it("returns the family_name when the full_name and given_name is not available", () => {
    const sessionWithoutGivenName = {
      ...session,
      user: { ...session.user, given_name: undefined, full_name: undefined },
    };
    const userFullName = getUserFullName(sessionWithoutGivenName);
    expect(userFullName).toBe("User");
  });

  it("returns the name when the full_name, given, family names are not available", () => {
    const sessionWithoutGivenName = {
      ...session,
      user: {
        ...session.user,
        given_name: undefined,
        family_name: undefined,
        full_name: undefined,
      },
    };
    const userFullName = getUserFullName(sessionWithoutGivenName);
    expect(userFullName).toBe("Test User name field");
  });

  it("returns empty string when the session is undefined", () => {
    const userFullName = getUserFullName(undefined);
    expect(userFullName).toBe("");
  });
});
