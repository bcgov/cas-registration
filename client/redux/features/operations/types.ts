export type Operation = any;

export type OperationsData = {
  data: Operation[] | null | undefined;
};

export type OperationsState = {
  value: [];
  status: "idle" | "loading" | "failed";
};
