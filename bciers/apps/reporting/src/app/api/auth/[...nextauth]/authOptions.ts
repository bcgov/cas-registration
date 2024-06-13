import { NextAuthOptions } from "next-auth";
import { authOptions as regAuthOptions } from "@/app/utils/auth/authOptions";

export const authOptions = regAuthOptions as NextAuthOptions;
