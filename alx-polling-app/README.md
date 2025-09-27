# ALX Polling App

A modern, full-stack polling application built with Next.js 15, TypeScript, and Shadcn/ui components. This project showcases AI-assisted development practices and modern web development techniques.

## 🤖 AI-Assisted Development

This project was developed using AI-powered coding assistance to demonstrate modern development workflows:

- **Architecture Design**: AI helped design the comprehensive system architecture including database schema, API structure, and component organization
- **Code Generation**: Rapid prototyping and implementation of authentication, poll management, and UI components
- **Best Practices**: AI guidance on TypeScript patterns, React hooks, and Supabase integration
- **Error Resolution**: AI-assisted debugging and relationship mapping between database tables
- **Documentation**: AI-generated comprehensive documentation and setup guides

## 🚀 Features

- **User Authentication**: Login/signup with Supabase Auth and email confirmation
- **Poll Management**: Create, view, edit, and delete polls with real-time updates
- **Voting System**: Secure voting with duplicate prevention and live results
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful components with Shadcn/ui and smooth animations
- **Type Safety**: Full TypeScript coverage with comprehensive type definitions
- **Real-time Updates**: Live vote counting and poll status updates
- **Security**: Row Level Security (RLS) and protected routes

## 📁 Project Structure

```
alx-polling-app/
├── app/                          # Next.js App Router
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── polls/                    # Poll management
│   │   ├── create/               # Create new poll
│   │   ├── [id]/                 # Individual poll view
│   │   └── [id]/edit/            # Edit poll page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── polls/                # Poll CRUD operations
│   │   └── votes/                # Voting system
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
│   ├── auth-context.tsx          # Authentication context
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
├── middleware.ts                 # Route protection middleware
└── README.md                     # This file
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Getting Started

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
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Configure authentication settings

4. **Environment Configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
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

## 📱 Pages & Features

### Authentication
- **Login** (`/login`): User authentication with email/password
- **Signup** (`/signup`): User registration with validation and profile creation

### Poll Management
- **Polls Dashboard** (`/polls`): View all public polls with owner controls
- **Create Poll** (`/polls/create`): Create new polls with multiple options
- **Poll Detail** (`/polls/[id]`): View individual poll and vote
- **Edit Poll** (`/polls/[id]/edit`): Edit poll details and options

### API Endpoints
- `GET /api/polls` - List all polls
- `POST /api/polls` - Create new poll
- `GET /api/polls/[id]` - Get poll details
- `PUT /api/polls/[id]` - Update poll
- `DELETE /api/polls/[id]` - Delete poll
- `POST /api/votes` - Submit vote
- `GET /api/votes` - Get votes for a poll
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

## 🎨 Components

### Poll Components
- `PollCard`: Display poll summary with results
- `PollVoting`: Interactive voting interface

### Auth Components
- `AuthForm`: Reusable login/signup form
- `UserProfile`: User profile dropdown with logout

### Shared Components
- `Navigation`: Main navigation bar with auth state
- `Alert`: Animated success/error messages

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

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

## 🗄️ Database Schema

The application uses Supabase with the following key tables:

- **profiles**: User profile information
- **polls**: Poll data with metadata
- **poll_options**: Poll voting options
- **votes**: User votes with constraints

All tables include Row Level Security (RLS) policies for data protection.

## 🚀 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: implement full-stack polling app with AI assistance"
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

## 🔄 Next Steps

### Immediate Development Tasks:
1. **Real-time Updates**: Implement Supabase Realtime subscriptions for live voting
2. **QR Code Generation**: Add QR code sharing functionality
3. **Poll Analytics**: Detailed voting statistics and insights
4. **Advanced Security**: Rate limiting and bot detection
5. **Mobile Optimization**: Enhanced mobile experience

### Advanced Features:
1. **Export Data**: CSV/PDF export of poll results
2. **Poll Templates**: Pre-built poll templates
3. **Advanced Analytics**: User engagement metrics
4. **Social Features**: Poll sharing and comments
5. **Mobile App**: React Native mobile app

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React Hook Form](https://react-hook-form.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

## 🎯 AI Development Highlights

This project demonstrates the power of AI-assisted development:

- **Rapid Prototyping**: Complete application built in record time
- **Best Practices**: AI guidance ensured modern patterns and security
- **Comprehensive Testing**: AI helped identify edge cases and error scenarios
- **Documentation**: Detailed docs generated with AI assistance
- **Code Quality**: Consistent, readable, and maintainable codebase

---

**Happy Polling!** 🗳️

*Built with ❤️ and AI assistance*