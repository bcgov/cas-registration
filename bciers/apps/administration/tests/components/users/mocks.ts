const getInternalAccessRequests = vi.fn();
const handleInternalAccessRequest = vi.fn();

vi.mock(
  "apps/administration/app/components/users/getInternalAccessRequests",
  () => ({
    default: getInternalAccessRequests,
  }),
);

vi.mock(
  "apps/administration/app/components/userOperators/cells/handleInternalAccessRequest",
  () => ({
    default: handleInternalAccessRequest,
  }),
);

export { getInternalAccessRequests, handleInternalAccessRequest };
