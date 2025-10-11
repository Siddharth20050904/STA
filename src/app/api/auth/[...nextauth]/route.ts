import { authOptions } from "@/lib/auth"; // Move authOptions to a separate file
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };