import { NextAuthOptions } from "next-auth";
import { authOptions as regAuthOptions } from "registration/api/auth/[...nextauth]/route";

export const authOptions = regAuthOptions as NextAuthOptions;
