import { NextAuthOptions } from "next-auth";
import { authOptions as reg1AuthOptions } from "@/app/utils/auth/authOptions";

export const authOptions = reg1AuthOptions as NextAuthOptions;
