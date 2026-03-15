import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      shopId: string
      shopName: string
      role: string
      impersonatingFrom?: string
    } & DefaultSession['user']
  }

  interface User {
    shopId?: string
    shopName?: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    shopId?: string
    shopName?: string
    role?: string
    impersonatingFrom?: string
  }
}
