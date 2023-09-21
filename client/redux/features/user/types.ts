// 📐 Type: Define User
export type User = {
  firstName: string;
  lastName: string;
};

// 📐 Type: Define the type for the users query result
export type UsersResult = {
  data: User[] | null | undefined;
  // Other fields from the result object...
};
