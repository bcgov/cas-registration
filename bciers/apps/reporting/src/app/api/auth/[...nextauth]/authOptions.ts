import { NextAuthOptions } from "next-auth";
import { authOptions as regAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export const authOptions = regAuthOptions as NextAuthOptions;
