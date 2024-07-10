const getOperation = vi.fn();

vi.mock("@/administration/app/components/operations/getOperation", () => ({
  default: getOperation,
}));

export { getOperation };
