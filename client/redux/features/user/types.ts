// 📐 Type: Define User
export type User = {
  firstName: string | null;
  lastName: string | null;
};

// 📐 Type: Define the type for the users query result
export type UserData = {
  data: User[] | null | undefined;
  // Other fields from the result object...
};
