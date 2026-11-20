import { actionHandler } from "@bciers/testConfig/mocks";
import {
  LOGIN_SYNC_ENDPOINT,
  syncUserProfileOnLogin,
} from "apps/dashboard/auth/syncUserProfile";

const USER_GUID = "ba2ba62a121842e0942aab9e92ce8822";
const storedProfile = {
  first_name: "Bob",
  last_name: "Smith",
  email: "old.email@email.com",
  bceid_business_name: "Old Business Name",
};

describe("syncUserProfileOnLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call the API when the user does not exist yet", async () => {
    await syncUserProfileOnLogin(
      USER_GUID,
      {},
      {
        email: "new.email@email.com",
        bceid_business_name: "New Business Name",
      },
    );
    await syncUserProfileOnLogin(USER_GUID, undefined, {
      email: "new.email@email.com",
    });

    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("does not call the API when nothing changed", async () => {
    await syncUserProfileOnLogin(USER_GUID, storedProfile, {
      email: " old.email@email.com ",
      bceid_business_name: "Old Business Name",
    });

    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("does not call the API when the identity provider values are empty", async () => {
    await syncUserProfileOnLogin(USER_GUID, storedProfile, {
      email: "",
      bceid_business_name: undefined,
    });

    expect(actionHandler).not.toHaveBeenCalled();
  });

  it("syncs the changed values", async () => {
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

  it("keeps the stored value for a field the identity provider did not send", async () => {
    await syncUserProfileOnLogin(USER_GUID, storedProfile, {
      email: "new.email@email.com",
      bceid_business_name: undefined,
    });

    expect(actionHandler).toHaveBeenCalledWith(
      expect.any(String),
      "PUT",
      undefined,
      {
        body: JSON.stringify({
          email: "new.email@email.com",
          bceid_business_name: "Old Business Name",
        }),
      },
    );
  });
});
