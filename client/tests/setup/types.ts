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
