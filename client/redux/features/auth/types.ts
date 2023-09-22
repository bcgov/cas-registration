import type { User } from "@/redux/index";

// 📐 Type: define structure for AuthState
export type AuthState = {
  user: User | null;
  token: string | null;
};

// 📐 Type: Define the response type for user login
export type LoginResponse = {
  user: User;
  token: string;
};

// 📐 Type: Define the request type for user login
export type LoginRequest = {
  email: string;
  password: string;
};
