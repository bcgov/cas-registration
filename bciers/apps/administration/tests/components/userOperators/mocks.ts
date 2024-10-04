const getOperator = vi.fn();
const getOperatorHasAdmin = vi.fn();
const getOperatorAccessDeclined = vi.fn();
const getAccessRequests = vi.fn();
const handleAccessRequestStatus = vi.fn();

vi.mock("apps/administration/app/components/operators/getOperator", () => ({
  default: getOperator,
}));
vi.mock(
  "apps/administration/app/components/operators/getOperatorHasAdmin",
  () => ({
    default: getOperatorHasAdmin,
  }),
);
vi.mock(
  "apps/administration/app/components/operators/getOperatorAccessDeclined",
  () => ({
    default: getOperatorAccessDeclined,
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
  getOperator,
  getOperatorHasAdmin,
  getOperatorAccessDeclined,
  getAccessRequests,
  handleAccessRequestStatus,
};
