import { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginAdmin, loginStudent, loginTeacher } from "@/app/api/auth/login";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      type: string;
      name: string;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    email: string;
    type: string;
    name: string;
    isVerified?: boolean;
  }
  interface JWT {
    id: string;
    email: string;
    type: string;
    name: string;
    isVerified?: boolean;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "" },
        password: { label: "Password", type: "password", placeholder: "" },
        type: { label: "Role", type: "text", placeholder: "" },
        token: { label: "JWT", type: "text", placeholder: "" },
      },
      async authorize(credentials) {

        let user;
        console.log(credentials);
        if(credentials!.type==="STUDENT"){
          if (!credentials?.email || !credentials.password) {
            console.log("Missing credentials");
            return null;
          }
          user = await loginStudent({email:credentials.email, password:credentials.password})
        }else if(credentials!.type==="ADMIN"){
          if (!credentials?.email || !credentials.password) {
            console.log("Missing credentials");
            return null;
          }
          user = await loginAdmin({email:credentials.email, password:credentials.password})
        }else{
          console.log("it is triggered");
          user = await loginTeacher(credentials!.token);
        }
        if(!user) return null;
        return {
          id: user.id,
          email: user.email,
          type: user.type,
          name: user.name,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.type = user.type;
        token.name = user.name;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.type = token.type as string;
        session.user.name = token.name as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};