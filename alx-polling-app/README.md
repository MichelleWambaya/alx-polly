# ALX Polling App

A modern, full-stack polling application built with Next.js 15, TypeScript, and Shadcn/ui components.

## 🚀 Features

- **User Authentication**: Login/signup with email and password
- **Poll Management**: Create, view, and manage polls
- **Voting System**: Secure voting with real-time updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful components with Shadcn/ui
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
alx-polling-app/
├── app/                          # Next.js App Router
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── polls/                    # Poll management
│   │   ├── create/               # Create new poll
│   │   └── [id]/                 # Individual poll view
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── polls/                # Poll CRUD operations
│   │   └── votes/                # Voting system
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root redirect
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   ├── auth/                     # Authentication components
│   ├── polls/                    # Poll-specific components
│   └── shared/                    # Shared components
├── lib/                          # Utilities and configurations
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript definitions
│   └── index.ts                  # Type definitions
└── README.md                     # This file
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

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

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

### Authentication
- **Login** (`/login`): User authentication with email/password
- **Signup** (`/signup`): User registration with validation

### Poll Management
- **Polls Dashboard** (`/polls`): View all public polls
- **Create Poll** (`/polls/create`): Create new polls with multiple options
- **Poll Detail** (`/polls/[id]`): View individual poll and vote

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
- `UserProfile`: User profile dropdown

### Shared Components
- `Navigation`: Main navigation bar

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
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (when you add a database)
# DATABASE_URL=your_database_url

# Authentication (when you add auth provider)
# NEXTAUTH_SECRET=your_secret_key
# NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Next Steps

### Immediate Development Tasks:
1. **Database Integration**: Add Supabase or your preferred database
2. **Authentication**: Implement real authentication logic
3. **Real-time Updates**: Add WebSocket support for live voting
4. **QR Code Generation**: Add QR code sharing functionality
5. **User Dashboard**: Build user profile and poll management

### Advanced Features:
1. **Poll Analytics**: Detailed voting statistics
2. **Export Data**: CSV/PDF export of poll results
3. **Poll Templates**: Pre-built poll templates
4. **Advanced Security**: Rate limiting and bot detection
5. **Mobile App**: React Native mobile app

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
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

---

**Happy Polling!** 🗳️