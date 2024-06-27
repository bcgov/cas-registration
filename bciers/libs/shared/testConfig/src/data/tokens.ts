export const mockBaseToken = {
  name: "Test User",
  email: "ggircs@test.ca",
  sub: "uuid",
  given_name: "Test",
  family_name: "User",
  bceid_business_name: "Cas, Bcgov",
  bceid_business_guid: "guid",
  user_guid: "guid",
  full_name: "Test User",
  iat: 1719517475,
  exp: 1719519275,
  jti: "uuid",
};

export const mockIndustryUserToken = {
  ...mockBaseToken,
  app_role: "industry_user",
  identity_provider: "bceidbusiness",
};

export const mockCasPendingToken = {
  ...mockBaseToken,
  app_role: "cas_pending",
  identity_provider: "idir",
};

export const mockCasUserToken = {
  ...mockBaseToken,
  app_role: "cas_user",
  identity_provider: "idir",
};
