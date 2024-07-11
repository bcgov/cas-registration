const getOperation = vi.fn();

vi.mock("apps/administration/app/components/operations/getOperation", () => ({
  default: getOperation,
}));

export { getOperation };
