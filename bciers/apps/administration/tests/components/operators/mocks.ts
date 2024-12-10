const getCurrentOperator = vi.fn();
const getOperator = vi.fn();
const getOperatorHasAdmin = vi.fn();
const getOperatorConfirmationInfo = vi.fn();
const getOperatorAccessDeclined = vi.fn();

vi.mock(
  "apps/administration/app/components/operators/getCurrentOperator",
  () => ({
    default: getCurrentOperator,
  }),
);

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
  "apps/administration/app/components/operators/getOperatorConfirmationInfo",
  () => ({
    default: getOperatorConfirmationInfo,
  }),
);
vi.mock(
  "apps/administration/app/components/operators/getOperatorAccessDeclined",
  () => ({
    default: getOperatorAccessDeclined,
  }),
);

export {
  getCurrentOperator,
  getOperator,
  getOperatorHasAdmin,
  getOperatorConfirmationInfo,
  getOperatorAccessDeclined,
};
