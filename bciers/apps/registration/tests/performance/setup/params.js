export const INDUSTRY_USER_GUID = "ba2ba62a121842e0942aab9e92ce8822";
export const INDUSTRY_USER_2_GUID = "279c80cf57814c28872740a133d17c0d";
export const INDUSTRY_USER_3_GUID = "00000000-0000-0000-0000-000000000002";
export const INTERNAL_USER_GUID = "4da70f32-65fd-4137-87c1-111f2daba3dd"; // Cas Director
export const CAS_DIRECTOR_USER_GUID = "4da70f32-65fd-4137-87c1-111f2daba3dd";
export const CAS_ADMIN_USER_GUID = "58f255ed-8d46-44ee-b2fe-9f8d3d92c684";
export const CAS_ANALYST_USER_GUID = "00000000-0000-0000-0000-000000000028";


export const industryUserParams = {
  headers: {
    "Content-Type": "application/json",
    Authorization: JSON.stringify({
      user_guid: INDUSTRY_USER_GUID,
    }),
  },
};

export const industryUser2Params = {
  headers: {
    "Content-Type": "application/json",
    Authorization: JSON.stringify({
      user_guid: INDUSTRY_USER_2_GUID,
    }),
  },
};

// User with no user operator fixtures
export const industryUser3Params = {
  headers: {
    "Content-Type": "application/json",
    Authorization: JSON.stringify({
      user_guid: INDUSTRY_USER_3_GUID,
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

export const getInternalUserParams = (role) => {
  let userGuid = "";
  switch (role) {
    case "cas_director":
      userGuid = CAS_DIRECTOR_USER_GUID;
      break;
    case "cas_admin":
      userGuid = CAS_ADMIN_USER_GUID;
      break;
    case "cas_analyst":
      userGuid = CAS_ANALYST_USER_GUID;
      break;
    default:
      return internalUserParams;
  }
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: JSON.stringify({
        user_guid: userGuid,
      }),
    },
  };
};
