import { actionHandler } from "@bciers/testConfig/mocks";
import {
  LOGIN_SYNC_ENDPOINT,
  syncUserProfileOnLogin,
} from "apps/dashboard/auth/syncUserProfile";

const USER_GUID = "ba2ba62a121842e0942aab9e92ce8822";
const storedProfile = {
  email: "old.email@email.com",
  bceid_business_name: "Old Business Name",
};

describe("syncUserProfileOnLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call the API when the user does not exist yet", async () => {
    const idpProfile = {
      email: "new.email@email.com",
      bceid_business_name: "New Business Name",
    };

    await syncUserProfileOnLogin(USER_GUID, {}, idpProfile);
    await syncUserProfileOnLogin(USER_GUID, undefined, idpProfile);
    await syncUserProfileOnLogin(undefined, storedProfile, idpProfile);

    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("sends the identity provider values to the backend for an existing user", async () => {
    await syncUserProfileOnLogin(USER_GUID, storedProfile, {
      email: "new.email@email.com",
      bceid_business_name: "New Business Name",
    });

    expect(actionHandler).toHaveBeenCalledOnce();
    expect(actionHandler).toHaveBeenCalledWith(
      `${LOGIN_SYNC_ENDPOINT}/${USER_GUID}`,
      "PUT",
      undefined,
      {
        body: JSON.stringify({
          email: "new.email@email.com",
          bceid_business_name: "New Business Name",
        }),
      },
    );
  });
});
