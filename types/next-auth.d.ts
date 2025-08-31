import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "CUSTOMER" | "MAID" | "ADMIN"
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "CUSTOMER" | "MAID" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "MAID" | "ADMIN"
  }
}
