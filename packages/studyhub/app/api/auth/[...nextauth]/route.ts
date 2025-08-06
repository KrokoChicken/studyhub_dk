import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// ✅ Must export GET and POST explicitly in App Router
export { handler as GET, handler as POST };