const getCurrentOperator = vi.fn();
const getBusinessStructures = vi.fn();

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

export { getCurrentOperator, getBusinessStructures };
