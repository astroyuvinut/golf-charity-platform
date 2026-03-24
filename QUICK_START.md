# Golf Charity Platform - Quick Start Guide 🚀

Complete setup and deployment guide for production.

## 1️⃣ Initial Setup (5 minutes)

### Install Dependencies

On your local machine, navigate to the project folder and run:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Configure Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values from Supabase and Stripe.

## 2️⃣ Set Up Supabase (Database) - 10 minutes

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `golf-charity-platform`
   - **Database Password**: Create a strong password and save it
   - **Region**: Select closest to your users
4. Click **Create new project** and wait 2-3 minutes

### Get Credentials

1. Go to **Settings** → **API** in left sidebar
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Settings** → **Database** → **Connection string** → **URI** (pooling)
4. In left sidebar, go to **Authentication** → **Settings**
5. Set **Site URL** to `http://localhost:3000` (for dev)

### Create Database Tables

1. In Supabase, go to **SQL Editor** (in left sidebar)
2. Click **New Query** and paste the SQL schema below ↓
3. Click **Run** to create all tables

**PASTE THIS SQL:**

```sql
-- Charities table with seed data
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  contact_email VARCHAR(255),
  minimum_donation_percent INTEGER DEFAULT 10 CHECK (minimum_donation_percent >= 0 AND minimum_donation_percent <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charities_slug ON charities(slug);
CREATE INDEX idx_charities_active ON charities(is_active);

INSERT INTO charities (name, slug, description, logo_url, website_url, contact_email, minimum_donation_percent) VALUES
('Birdies for Kids Foundation', 'birdies-for-kids', 'Supporting youth golf programs and underprivileged children through the sport of golf.', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200', 'https://birdiesforkids.org', 'info@birdiesforkids.org', 10),
('Links to Literacy', 'links-to-literacy', 'Using golf as a vehicle to promote reading and educational opportunities.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200', 'https://linkstoliteracy.org', 'contact@linkstoliteracy.org', 10),
('First Tee - Junior Golf', 'first-tee', 'Empowering youth to build character and life skills through the game of golf.', 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200', 'https://firsttee.org', 'programs@firsttee.org', 10),
('Veterans Golf Association', 'veterans-golf', 'Honoring veterans through therapeutic golf programs and support services.', 'https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=200', 'https://veteransgolf.org', 'support@veteransgolf.org', 10),
('Environmental Golf Initiative', 'environmental-golf', 'Promoting sustainability and environmental stewardship within the golf community.', 'https://images.unsplash.com/photo-1596362601603-ecc6daa7c1dd?w=200', 'https://environmentalgolf.org', 'green@environmentalgolf.org', 10);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  handicap_index DECIMAL(3,1),
  selected_charity_id UUID REFERENCES charities(id),
  donation_percent INTEGER DEFAULT 10 CHECK (donation_percent >= 10 AND donation_percent <= 100),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_charity ON profiles(selected_charity_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'trialing',
  payment_status VARCHAR(50) DEFAULT 'active',
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

> **Note**: This creates the essential tables. For complete schema with draws, scores, winnings, etc., see the full `supabase/migrations/001_initial_schema.sql` file.

## 3️⃣ Set Up Stripe (Payments) - 10 minutes

### Create Products

1. Go to [stripe.com](https://stripe.com) and sign up/log in
2. Go to **Products** → **Create**
3. Create Monthly Plan:
   - Name: `Monthly Golf Membership`
   - Price: `29.99`
   - Recurring: Monthly
   - Copy the **Price ID** → `STRIPE_MONTHLY_PRICE_ID` in `.env.local`

4. Create Yearly Plan:
   - Name: `Yearly Golf Membership`
   - Price: `249.99`
   - Recurring: Yearly
   - Copy the **Price ID** → `STRIPE_YEARLY_PRICE_ID` in `.env.local`

### Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Secret Key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`
   - **Publishable Key** (starts with `pk_test_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Later for Production

When moving to production:
1. Request Live Access from Stripe
2. Switch to Live keys (`sk_live_` and `pk_live_`)
3. Update environment variables
4. Set up webhooks (see deployment guide)

## 4️⃣ Run Development Server - 2 minutes

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### What to Test

- ✅ Landing page loads
- ✅ Click "Sign Up"
- ✅ Create test account
- ✅ Dashboard appears
- ✅ Add a golf score
- ✅ View charities

## 5️⃣ Deploy to Vercel (Live) - 15 minutes

### Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial Golf Charity Platform"
git remote add origin https://github.com/YOUR_USERNAME/golf-charity-platform.git
git branch -M main
git push -u origin main
```

### Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up (connect GitHub)
3. Click **"New Project"**
4. Select your GitHub repo
5. Click **"Import"**
6. Vercel auto-configures Next.js
7. Click **"Deploy"**

### Add Environment Variables

Before deployment completes:

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_value
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
   SUPABASE_SERVICE_ROLE_KEY=your_value
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_value
   STRIPE_SECRET_KEY=your_value
   STRIPE_WEBHOOK_SECRET=whsec_test_... (generate in Stripe)
   STRIPE_MONTHLY_PRICE_ID=price_...
   STRIPE_YEARLY_PRICE_ID=price_...
   NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
   NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
   ```
3. Click **Save**
4. Go to **Deployments** → **...** → **Redeploy**

### Wait for Deployment

- Check **Deployments** tab
- Once green checkmark appears, your app is live! ✅

Visit: `https://your-vercel-app.vercel.app`

## 6️⃣ Set Up Stripe Webhooks (Production Only)

After deploying to Vercel:

1. Go to Stripe → **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter:
   - **Endpoint URL**: `https://your-vercel-app.vercel.app/api/webhooks/stripe`
   - **Events**: Select subscription and invoice events
4. Copy **Signing Secret** → Update `STRIPE_WEBHOOK_SECRET` in Vercel env vars
5. **Redeploy** the Vercel app

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Node.js installed locally
- [ ] GitHub account with repository
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Repository pushed to GitHub

### Supabase Setup
- [ ] Project created
- [ ] Database tables created
- [ ] Environment credentials copied

### Stripe Setup
- [ ] Monthly product created with price
- [ ] Yearly product created with price
- [ ] API keys copied to `.env.local`
- [ ] Webhook endpoint configured (for production)

### Vercel Deployment
- [ ] GitHub repository connected
- [ ] All environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] Live URL accessible
- [ ] Auth flow tested (sign up/log in)

## 🧪 Test the Live App

### Create Test Account
```
Email: test@example.com
Password: TestPass123!
```

### Subscribe to Monthly Plan
- Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Test Score Entry
- Add 5 golf scores
- Check dashboard
- Verify scores appear

## 📞 Support

- **Issues**: Check README.md
- **Deployment Help**: See DEPLOYMENT.md
- **Code Issues**: Check GitHub Issues
- **Stripe Issues**: stripe.com/support
- **Supabase Issues**: supabase.com/support

## 🎯 Next Steps

1. **Customize Branding**
   - Update colors in `tailwind.config.ts`
   - Replace logo in `public/`
   - Update copy in `src/app/page.tsx`

2. **Add Your Charities**
   - Update 5 seed charities in Supabase
   - Add your charity logos/descriptions

3. **Configure Email**
   - Set up Supabase Email provider
   - Test password reset flow

4. **Set Up Custom Domain**
   - Add domain in Vercel Settings
   - Update DNS records
   - Update Supabase auth URLs

5. **Monitor & Scale**
   - Enable Vercel Analytics
   - Monitor Supabase usage
   - Check Stripe transactions

---

## 🎉 You're Done!

Your Golf Charity Platform is now **LIVE** and ready for users!

### What's Included

✅ Subscription system (Stripe)
✅ User authentication (Supabase)
✅ Score tracking
✅ Monthly draws
✅ Charity donations
✅ Admin panel
✅ Beautiful UI with modern cursor effects
✅ Fully responsive mobile design
✅ Secure & scalable architecture

### Start accepting users today! 🏌️
