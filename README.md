# Golf Charity Platform 🏌️‍♂️

A modern, full-stack golf subscription platform where players track their scores, enter monthly prize draws, and contribute to charities they care about.

## Features ✨

- **Subscription Management** - Monthly and yearly plans powered by Stripe
- **Score Tracking** - Log golf scores in Stableford format (0-45 points)
- **Monthly Draws** - Automatic entry with your last 5 score digits
- **Prize System** - Tiered prizes (5-match jackpot, 4-match, 3-match)
- **Charity Integration** - Direct donations to 5+ verified charities
- **Admin Dashboard** - Manage users, draws, and verify winners
- **Modern UI** - Beautiful glass-morphism design with smooth animations
- **Custom Cursor** - Modern animated cursor effects
- **Secure Auth** - Supabase authentication with JWT

## Tech Stack 🚀

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Payments**: Stripe (subscriptions & payments)
- **Hosting**: Vercel
- **Auth**: Supabase (with RLS policies)
- **Database**: PostgreSQL (Supabase)

## Project Structure 📁

```
golf-charity-platform/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components (UI, shared, etc.)
│   ├── lib/              # Utilities, Supabase, Stripe, auth
│   ├── types/            # TypeScript definitions
│   ├── hooks/            # Custom React hooks
│   ├── middleware.ts     # Auth middleware
│   └── styles/           # Global styles
├── public/               # Static assets
├── supabase/            # Database migrations
├── .env.example         # Environment variables template
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config
└── vercel.json          # Vercel deployment config
```

## Getting Started 🎯

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- A Stripe account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd golf-charity-platform
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in the following variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `STRIPE_MONTHLY_PRICE_ID` - Price ID for monthly plan
- `STRIPE_YEARLY_PRICE_ID` - Price ID for yearly plan

3. **Set up Supabase**
   - Create a new project on Supabase
   - Go to SQL Editor and execute the database schema from `supabase/migrations/001_initial_schema.sql`
   - Enable Row Level Security (RLS) for all tables
   - Configure authentication providers

4. **Configure Stripe**
   - Create Monthly and Yearly products and prices
   - Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Copy your API keys and price IDs

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment 🌐

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/golf-charity-platform.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Deploy!

4. **Set up Stripe Webhook**
   - After deployment, update Stripe webhook endpoint to your Vercel URL
   - Test webhook: `stripe listen --forward-to https://your-vercel-app.vercel.app/api/webhooks/stripe`

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start

# Deploy manually to your platform
# (e.g., Docker, Railway, Render, etc.)
```

## API Routes 📡

### Authentication
- `POST /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout

### Subscriptions
- `POST /api/subscriptions/create` - Create checkout session
- `POST /api/subscriptions/cancel` - Cancel subscription

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Add new score
- `DELETE /api/scores/[id]` - Delete score

### Draws
- `GET /api/draws` - Get all draws
- `POST /api/draws/participate` - Join draw
- `POST /api/draws/execute` - Execute draw (admin only)

### Charities
- `GET /api/charities` - Get active charities

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Database Schema 📊

### Key Tables
- **profiles** - User accounts and preferences
- **subscriptions** - Active subscriptions
- **scores** - Golf scores (Stableford)
- **charities** - Supported charities
- **draws** - Monthly lottery draws
- **draw_participations** - User entries in draws
- **winnings** - Prize winnings
- **verification_submissions** - Winner verification

See `supabase/migrations/` for complete schema.

## Features in Detail 🎪

### Score Management
- Track last 5 scores automatically
- Stableford scoring format (0-45 points)
- Course and tee information
- Score verification for winners

### Draw Engine
- Automatic monthly draws
- Weighted or random number generation
- Prize tier distribution (40% / 35% / 25%)
- Jackpot rollover mechanism
- Winner calculation with charity deductions

### Charity System
- 5+ verified charities
- Customizable donation percentage (10-100%)
- Transparent donation tracking
- Charity impact statistics

### Admin Controls
- User management
- Draw creation and execution
- Winner verification
- Financial reporting
- Charity management

## Modern Cursor Effects 🎨

The platform includes:
- Custom animated cursor with glow effect
- Smooth pointer trail animations
- Interactive hover states
- Gradient cursor outline
- Glass-morphism design elements
- Smooth scroll behavior
- Page transition animations

## Testing 🧪

```bash
# Run linter
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build
```

## Performance Optimizations ⚡

- Image optimization with Next.js Image
- CSS-in-JS with Tailwind CSS
- Efficient server-side rendering
- Supabase connection pooling
- Stripe API caching
- Optimized animations (Framer Motion)
- Reduced motion support

## Security 🔒

- Row Level Security (RLS) on all tables
- Secure authentication with JWT
- HTTPS-only (production)
- Environment variable protection
- SQL injection prevention
- CSV injection protection
- Stripe webhook signature verification
- CORS configuration

## Browser Support 🌐

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome)

## Troubleshooting 🔧

### Stripe Webhook Issues
```bash
# Test locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check logs
stripe logs
```

### Supabase Connection
- Verify Environment variables
- Check Supabase project status
- Enable RLS policies
- Ensure service role key has admin access

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Contributing 🤝

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 📄

MIT License - feel free to use this for your projects!

## Support 💬

- Email: support@golfcharity.app
- Issues: GitHub Issues
- Docs: See project README

## Roadmap 🗺️

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Leaderboards and rankings
- [ ] Social features (friends, sharing)
- [ ] Tournament mode
- [ ] NFT integration
- [ ] Multi-currency support
- [ ] API for third-party apps

---

Built with ❤️ by the Golf Charity Team

**Happy Golfing! 🏌️⎌**
