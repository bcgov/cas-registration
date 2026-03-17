const getTransferEvent = vi.fn();

vi.mock("@/registration/app/components/transfers/getTransferEvent", () => ({
  default: getTransferEvent,
}));

export { getTransferEvent };
