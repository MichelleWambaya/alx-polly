# ALX Polling App

A modern, full-stack polling application built with Next.js 15, TypeScript, and Supabase. This project demonstrates secure web development practices with comprehensive input validation, server-side authorization, and production-ready security features.

## Project Overview

The ALX Polling App is a comprehensive web application that allows users to create, share, and participate in polls. Built with modern web technologies, it features secure authentication, real-time voting, and a responsive user interface.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Security**: Server Actions, Input Validation, Rate Limiting
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel

## Features

- **Secure Authentication**: Supabase Auth with email confirmation
- **Poll Management**: Create, view, edit, and delete polls with ownership verification
- **Voting System**: Secure voting with duplicate prevention and live results
- **QR Code Sharing**: Generate and share polls via QR codes
- **User Settings**: Comprehensive profile and notification management
- **Security**: Server-side validation, rate limiting, and security headers
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript coverage with comprehensive type definitions

## Project Structure

```
alx-polling-app/
├── app/                          # Next.js App Router
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── polls/                    # Poll management
│   │   ├── create/               # Create new poll
│   │   ├── [id]/                 # Individual poll view
│   │   └── [id]/edit/            # Edit poll page
│   ├── settings/                 # User settings page
│   ├── profile/                  # User profile page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with auth provider
│   └── page.tsx                  # Root redirect
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   ├── auth/                     # Authentication components
│   ├── polls/                    # Poll-specific components
│   └── shared/                   # Shared components
├── lib/                          # Utilities and configurations
│   ├── supabase/                 # Supabase client configs
│   ├── actions/                  # Server actions for secure operations
│   ├── auth-context.tsx          # Authentication context
│   ├── validation.ts             # Input validation schemas
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
├── middleware.ts                 # Route protection and security headers
└── README.md                     # This file
```

## Setup Steps

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd alx-polling-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Run the SQL schema from `supabase/schema.sql` in the SQL editor
   - Configure authentication settings in Authentication > Settings

4. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Examples

### Creating Polls

1. **Sign up or log in** to your account
2. **Navigate to Create Poll** by clicking "Create New Poll" on the dashboard
3. **Fill in poll details**:
   - Title (required, max 200 characters)
   - Description (optional, max 1000 characters)
   - Add 2-10 poll options
   - Set voting preferences (single or multiple votes)
   - Optional: Set a closing date
4. **Submit the poll** - you'll be redirected to the poll with a QR code for sharing

### Voting on Polls

1. **Browse polls** on the main dashboard
2. **Click on a poll** to view details and voting options
3. **Select your choice(s)** based on the poll's voting rules
4. **Submit your vote** - results update immediately
5. **View live results** with vote counts and percentages

### Managing Your Polls

- **Edit polls**: Click "Edit" on your polls to modify details
- **Delete polls**: Use the "Delete" button with confirmation
- **Share polls**: Use the QR code or share button to distribute your poll
- **View analytics**: See vote counts and participation rates

### User Settings

- **Profile management**: Update your display name and bio
- **Notification preferences**: Control email and poll notifications
- **Privacy settings**: Manage profile visibility and email display
- **Appearance**: Choose between light, dark, or system theme
- **Language**: Select your preferred language

## Components

### Poll Components
- `PollCard`: Display poll summary with results
- `PollVoting`: Interactive voting interface
- `QRCodeModal`: QR code generation and sharing
- `PollResultChart`: Visual representation of poll results

### Auth Components
- `AuthForm`: Reusable login/signup form
- `UserProfile`: User profile dropdown with logout

### Shared Components
- `Navigation`: Main navigation bar with auth state
- `Alert`: Animated success/error messages

## How to Run and Test the App Locally

### Development Server

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

### Testing the Application

1. **Test Authentication**:
   - Sign up with a new email
   - Check your email for confirmation link
   - Log in with your credentials

2. **Test Poll Creation**:
   - Create a poll with multiple options
   - Test validation (try submitting without title)
   - Verify poll appears on dashboard

3. **Test Voting**:
   - Vote on a poll you created
   - Try voting multiple times (should be prevented for single-vote polls)
   - Check that results update immediately

4. **Test Poll Management**:
   - Edit a poll you created
   - Delete a poll (with confirmation)
   - Test QR code generation and sharing

5. **Test User Settings**:
   - Update your profile information
   - Change notification preferences
   - Test theme switching

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For production deployments
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Database Schema

The application uses Supabase with the following key tables:

- **profiles**: User profile information and settings
- **polls**: Poll data with metadata and ownership
- **poll_options**: Poll voting options with positioning
- **votes**: User votes with constraints and timestamps

All tables include Row Level Security (RLS) policies for data protection and user isolation.

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: implement secure polling app with comprehensive validation"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

### 3. Update Supabase Settings
1. Update Site URL in Supabase Auth settings
2. Add your Vercel domain to allowed origins
3. Update redirect URLs for OAuth

## Security Features

- **Server-side validation**: All inputs validated with Zod schemas
- **Rate limiting**: Prevents abuse with configurable limits
- **Input sanitization**: XSS protection and data cleaning
- **Authorization**: Server-side ownership verification
- **Security headers**: CSP, XSS protection, and frame options
- **Secure sessions**: Proper session management and timeout
- **Error handling**: No information disclosure in error messages

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React Hook Form](https://react-hook-form.com)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**Happy Polling!**

*Built with secure development practices and modern web technologies*

---

**Author**: Michelle Wambaya