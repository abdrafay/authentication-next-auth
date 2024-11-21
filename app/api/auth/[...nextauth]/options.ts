// https://npmjs.com/package/@auth/mongodb-adapter
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import connectDB from "@/lib/db";
import User from "@/lib/models/user.model"

// token and session parameters are of type User

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials:  {
                email: { label: "Email", type: "text" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials:any): Promise<any> {
                await connectDB();
                try {
                    const user = await User.findOne({
                        email: credentials.email
                    })
                    if (!user) {
                        throw new Error('No user found')
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password)

                    if (isValid) {
                        return { email: user.email, role: user.role }
                    }

                    throw new Error('Incorrect Password')
                } catch(err: any) {
                    throw new Error(err)
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.email = user.email
                token.role = user.role
            }
            return token
        },
        async session({session, token}) {
            if (token) {
                session.user._id = token._id as string
                session.user.email = token.email ?? ''
                session.user.role = token.role as string
            } 
            return session 
        }
    }
}