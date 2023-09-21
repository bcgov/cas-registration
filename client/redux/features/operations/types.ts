export type Operation = any;

export type OperationsData = {
  operations: Operation[] | null | undefined;
};

export type OperationsState = {
  value: [];
  status: "idle" | "loading" | "failed";
};
