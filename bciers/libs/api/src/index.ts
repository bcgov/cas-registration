import type { components } from "./generated/schema";

// Raw-generated types, for cases the helper below does not cover
export type { components, paths } from "./generated/schema";

type Schemas = components["schemas"];

export type ApiSchema<K extends keyof Schemas> = Schemas[K];
