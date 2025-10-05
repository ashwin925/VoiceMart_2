import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '../app/models/User';
import dbConnect from './mongoose';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing email or password');
            throw new Error('Email and password are required');
          }

          console.log('🔐 Attempting login for:', credentials.email);

          // Connect to database
          await dbConnect();
          console.log('✅ Database connected');

          // Find user by email (case insensitive)
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase().trim() 
          });
          
          if (!user) {
            console.log('❌ No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('✅ User found:', user.email);

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            console.log('❌ Invalid password for user:', user.email);
            throw new Error('Invalid email or password');
          }

          console.log('✅ Password verified for user:', user.email);

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('🔐 Authentication error:', error.message);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add role to token on sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Update token if session is updated
      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
};

export default NextAuth(authOptions);