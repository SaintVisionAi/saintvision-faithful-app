import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for build
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Temporarily disabled for Vercel deployment
        // TODO: Re-enable after Prisma is properly configured
        return null
        
        // if (!credentials?.email || !credentials?.password) {
        //   return null
        // }

        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email }
        // })

        // if (!user || !user.password) {
        //   return null
        // }

        // const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        // if (!isPasswordValid) {
        //   return null
        // }

        // return {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   image: user.image,
        //   tier: user.tier,
        //   isFounder: user.isFounder,
        // }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tier = user.tier
        token.isFounder = user.isFounder
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.tier = token.tier as string
        session.user.isFounder = token.isFounder as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    // signUp: '/signup', // Removed for build compatibility
  },
  secret: process.env.NEXTAUTH_SECRET,
}