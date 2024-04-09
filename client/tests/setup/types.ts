// TODO(Nx Migration): Module added to Monorepo at `bciers/libs/shared/testConfig/src/setup/types.ts`

export interface QueryParams {
  formSection?: string;
  operation?: string;
  operator?: string;
}

export interface Router {
  query: QueryParams;
  replace: () => void;
}

export interface Session {
  data: {
    user: {
      app_role: string;
    };
  };
}
