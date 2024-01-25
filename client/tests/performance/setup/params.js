const INDUSTRY_USER_GUID = "279c80cf57814c28872740a133d17c0d";
const INTERNAL_USER_GUID = "4da70f32-65fd-4137-87c1-111f2daba3dd";

export const industryUserParams = {
  headers: {
    "Content-Type": "application/json",
    Authorization: JSON.stringify({
      user_guid: INDUSTRY_USER_GUID,
    }),
  },
};

export const internalUserParams = {
  headers: {
    "Content-Type": "application/json",
    Authorization: JSON.stringify({
      user_guid: INTERNAL_USER_GUID,
    }),
  },
};
