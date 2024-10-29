const getCurrentOperator = vi.fn();
const getBusinessStructures = vi.fn();

const getOperator = vi.fn();

vi.mock(
  "apps/administration/app/components/operators/getCurrentOperator",
  () => ({
    default: getCurrentOperator,
  }),
);
vi.mock(
  "apps/administration/app/components/operators/getBusinessStructures",
  () => ({
    default: getBusinessStructures,
  }),
);
vi.mock("@/administration/app/components/operators/getOperator", () => ({
  default: getOperator,
}));

export { getCurrentOperator, getBusinessStructures, getOperator };
