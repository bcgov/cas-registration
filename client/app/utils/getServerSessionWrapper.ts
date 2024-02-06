import { mockSession } from "@/mock/mocksession";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const getServerSessionWrapper = async () => {
  const session = process.env.BYPASS ? mockSession : await getServerSession(authOptions);
  return session;
}
