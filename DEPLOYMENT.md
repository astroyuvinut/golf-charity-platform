# Deployment Guide 🚀

Complete step-by-step guide to deploy the Golf Charity Platform to production.

## Prerequisites

- Git account (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier works)
- Supabase account
- Stripe account (Live keys)
- Domain name (optional, Vercel provides subdomain)

## Step 1: Prepare Local Repository

```bash
# Initialize git (if not already done)
cd golf-charity-platform
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Golf Charity Platform setup"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/golf-charity-platform.git

# Create main branch and push
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase (Database)

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: golf-charity-platform
   - **Database Password**: Create strong password
   - **Region**: Select closest to users
   - **Pricing Plan**: Free tier is fine for testing

4. Wait for project initialization (2-3 minutes)

### Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Create new query and paste schema from `supabase/migrations/001_initial_schema.sql`
3. Run query to create all tables, indexes, and RLS policies

### Get Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Enable Authentication

1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Go to **Settings** → **Auth** and set:
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Redirect URLs: `https://your-vercel-domain.vercel.app/api/auth/callback`

## Step 3: Set Up Stripe (Payments)

### Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up and verify account
3. Complete onboarding (may take 24 hours for live mode)

### Create Products & Prices

**Monthly Plan:**
1. Go to **Products** → **Create**
2. Fill in:
   - Name: Monthly Golf Membership
   - Price: $29.99 USD
   - Recurring: Monthly
3. Copy the **Price ID** → `STRIPE_MONTHLY_PRICE_ID`

**Yearly Plan:**
1. Create another product
2. Fill in:
   - Name: Yearly Golf Membership
   - Price: $249.99 USD
   - Recurring: Yearly
3. Copy the **Price ID** → `STRIPE_YEARLY_PRICE_ID`

### Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Secret Key** → `STRIPE_SECRET_KEY` (sk_live_xxx)
   - **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_xxx)

### Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Fill in:
   - Endpoint URL: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
   - Events to send: Select all subscription and invoice events
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` (whsec_xxx)

## Step 4: Deploy to Vercel

### Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Click **Import Git Repository**
4. Select your GitHub repository
5. Click **Import**

### Configure Project

1. Vercel auto-detects Next.js
2. Leave build settings as default
3. Click **Deploy** button

### Add Environment Variables

After deployment is triggered:

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=<from supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase>
SUPABASE_SERVICE_ROLE_KEY=<from supabase>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from stripe>
STRIPE_SECRET_KEY=<from stripe>
STRIPE_WEBHOOK_SECRET=<from stripe>
STRIPE_MONTHLY_PRICE_ID=<from stripe>
STRIPE_YEARLY_PRICE_ID=<from stripe>
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

3. Click **Save**
4. Go to **Deployments** → **Redeploy** to apply variables

### Verify Deployment

1. Your app is now live at `https://your-vercel-domain.vercel.app`
2. Check console for any errors
3. Test signup and login flow

## Step 5: Update Stripe Webhook

After Vercel deployment:

1. Go back to Stripe → **Developers** → **Webhooks**
2. Update existing webhook endpoint URL to your Vercel domain
3. Test webhook by making a test payment

## Step 6: Custom Domain (Optional)

### Connect Custom Domain to Vercel

1. Go to Vercel **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., golfcharity.app)
4. Follow DNS configuration for your registrar
5. Wait for SSL certificate (usually instant)

### Update Supabase Auth Settings

1. Go to Supabase → **Settings** → **Auth**
2. Update Site URL: `https://golfcharity.app`
3. Update Redirect URLs: `https://golfcharity.app/api/auth/callback`

### Update Stripe Webhook

1. Update webhook URL in Stripe to `https://golfcharity.app/api/webhooks/stripe`

## Step 7: Enable Monitoring

### Vercel Analytics

1. Go to Vercel **Project Settings** → **Analytics**
2. Enable **Web Analytics**
3. Monitor performance metrics

### Error Tracking

1. Go to **Project Settings** → **Integrations**
2. Connect error tracking service (optional):
   - Sentry
   - LogRocket
   - Bug tracking tool

## Post-Deployment Checklist ✅

- [ ] Supabase project created and populated
- [ ] All database tables created
- [ ] RLS policies enabled
- [ ] Stripe products created
- [ ] Stripe webhooks configured
- [ ] Code pushed to GitHub
- [ ] Vercel account connected to GitHub
- [ ] Project deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Stripe webhook tested
- [ ] Auth flow tested (signup/login)
- [ ] Payment flow tested
- [ ] Email authentication works
- [ ] Analytics enabled

## Testing in Production

### User Authentication
```bash
# Test signup
Navigate to https://your-domain.vercel.app/signup
Create test account
Verify email confirmation
```

### Payment Processing
```bash
# Use Stripe test card
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

# Test subscription
Subscribe to monthly plan
Verify in Stripe dashboard
```

### Draw Functionality
```bash
# Add test scores
Submit 5 golf scores
Verify scores appear in dashboard
Test draw participation
```

## Troubleshooting

### Deployment Failed
```bash
# Check build logs in Vercel Dashboard
# Common issues:
# 1. Missing environment variables
# 2. Supabase connection error
# 3. Stripe API key invalid
# 4. TypeScript compilation error
```

### Webhook Not Working
```bash
# Test webhook with Stripe CLI
stripe listen --forward-to https://your-domain.vercel.app/api/webhooks/stripe

# Check logs in Stripe Dashboard
# Verify webhook secret is correct
```

### Auth Issues
```bash
# Verify Supabase auth enabled
# Check Site URL matches domain
# Clear browser cookies
# Test in incognito window
```

## Maintenance

### Database Backups
- Supabase automatically backs up daily (free tier)
- Enable daily backups in Supabase settings
- Download backups regularly (paid tier feature)

### Monitoring
- Check Vercel analytics daily
- Monitor Supabase logs
- Review Stripe transactions
- Set up error alerts

### Updates
- Keep Next.js updated
- Update dependencies monthly
- Monitor security advisories
- Test updates in staging first

## Scaling Plan

### When to Upgrade

**Free → Paid Supabase** when:
- >100GB stored
- >10k API requests/day
- Custom backups needed
- Enterprise features required

**Free → Pro Vercel** when:
- >100k invocations/month
- Need custom domains
- Advanced analytics required
- Priority support needed

---

**Deployment complete! 🎉**

Your Golf Charity Platform is now live and ready for users.

For support, check the main README or visit documentation.
