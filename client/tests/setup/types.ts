export interface Query {
  formSection?: string;
  operation?: string;
  operator?: string;
}

export interface Router {
  query: Query;
  replace: () => void;
}

export interface Session {
  data: {
    user: {
      app_role: string;
    };
  };
}
