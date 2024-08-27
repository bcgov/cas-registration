const getOperator = vi.fn();
const getOperatorHasAdmin = vi.fn();
const getOperatorAccessDeclined = vi.fn();

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
export { getOperator, getOperatorHasAdmin, getOperatorAccessDeclined };
