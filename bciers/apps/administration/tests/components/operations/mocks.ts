const getOperation = vi.fn();

vi.mock("libs/actions/src/api/getOperation", () => ({
  default: getOperation,
}));

export { getOperation };
