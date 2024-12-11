const getAccessRequests = vi.fn();
const handleAccessRequestStatus = vi.fn();
const getUserOperatorFormData = vi.fn();

vi.mock(
  "apps/administration/app/components/userOperators/getUserOperatorFormData",
  () => ({
    default: getUserOperatorFormData,
  }),
);

vi.mock(
  "apps/administration/app/components/userOperators/getAccessRequests",
  () => ({
    default: getAccessRequests,
  }),
);

vi.mock(
  "apps/administration/app/components/userOperators/cells/handleAccessRequestStatus",
  () => ({
    default: handleAccessRequestStatus,
  }),
);

export {
  getAccessRequests,
  handleAccessRequestStatus,
  getUserOperatorFormData,
};
