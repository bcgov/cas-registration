const getOperation = vi.fn();

vi.mock("apps/registration/app/components/operations/getOperation", () => ({
  default: getOperation,
}));

export { getOperation };
