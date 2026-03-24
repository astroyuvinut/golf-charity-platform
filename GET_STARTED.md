# 🚀 GET STARTED IN 10 MINUTES

Your **Golf Charity Platform** is ready! Follow these 10 steps to get it live.

---

## ⚡ STEP 1: Understand What You Have (2 min)

✅ **Complete project with:**
- Landing page (done)
- Custom animated cursor effects (done)
- Database structure (ready)
- Payment system (Stripe configured)
- Authentication system (Supabase configured)
- API routes structure (ready)
- Beautiful modern UI (done)
- Dark theme with gold accents (done)

❌ **What you need to add:**
- Fill in credentials (Supabase + Stripe)
- Few more pages (quick to build)
- Deploy to Vercel (1-click)

---

## 📝 STEP 2: Get Credentials (Need: Supabase Account)

### Get Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project name: `golf-charity-platform`
4. Save your database password safely
5. Wait 2-3 minutes for project to initialize

### Copy These Values
From Supabase → **Settings** → **API**:
```
NEXT_PUBLIC_SUPABASE_URL = (copy Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (copy anon public key)
SUPABASE_SERVICE_ROLE_KEY = (copy service_role secret)
```

---

## 💳 STEP 3: Create Stripe Account (Need: Stripe Account)

### Get Stripe
1. Go to [stripe.com](https://stripe.com)
2. Sign up and complete onboarding
3. Go to **Products** and create:
   - **Product 1**: Monthly ($29.99)
   - **Product 2**: Yearly ($249.99)

### Copy Price IDs
For each product, copy the **Price ID**:
```
STRIPE_MONTHLY_PRICE_ID = price_xxx
STRIPE_YEARLY_PRICE_ID = price_xxx
```

### Get API Keys
From **Developers** → **API Keys**:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_xxx
STRIPE_SECRET_KEY = sk_test_xxx
```

---

## 🔑 STEP 4: Fill Environment Variables (2 min)

Edit `.env.local` in project root:

```env
# Supabase (from supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe (from stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234...
STRIPE_SECRET_KEY=sk_test_51234...
STRIPE_WEBHOOK_SECRET=whsec_test_51234...
STRIPE_MONTHLY_PRICE_ID=price_1234...
STRIPE_YEARLY_PRICE_ID=price_1234...

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

✅ Save file

---

## 🗄️ STEP 5: Create Database Tables (3 min)

### In Supabase
1. Go to **SQL Editor**
2. Click **New Query**
3. Paste query from **QUICK_START.md** (section "Create Database Tables")
4. Click **Run**
5. Wait for confirmation

✅ Tables created!

---

## 💻 STEP 6: Run Locally (1 min)

Open terminal in project folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

### Test It
- ✅ Landing page loads?
- ✅ Cursor animation works?
- ✅ Buttons clickable?

---

## ☁️ STEP 7: Deploy to Vercel (5 min MAX)

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial Golf Charity Platform"
git remote add origin https://github.com/YOUR_USERNAME/golf-charity-platform.git
git branch -M main
git push -u origin main
```

### Connect Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Find your GitHub repo
4. Click **Import**
5. **DON'T CLICK DEPLOY YET!** ⏸️

### Add Environment Variables
1. Stay on the import screen
2. Click **Environment Variables**
3. Paste all values from `.env.local`
4. Now click **Deploy**

### Wait...
Monitor progress, will say:
```
✅ Deployment successful!
Your site is live at: https://your-app.vercel.app
```

---

## 🎉 STEP 8: You're LIVE!

Your app is now running at: `https://your-vercel-domain.vercel.app`

### Test Payment (Stripe)
Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

---

## 📚 NEXT STEPS

### Add More Pages (Optional)
See **QUICK_START.md** section "Test the Live App" for:
- Creating accounts
- Adding scores
- Testing subscriptions

### Customize
- Colors: Edit `tailwind.config.ts`
- Logo: Put image in `public/`
- Text: Edit `src/app/page.tsx`

### Get More Features
See **README.md** for:
- API documentation
- Database schema
- Feature breakdown
- Architecture details

---

## 📞 TROUBLESHOOTING

### npm install fails
```bash
npm clear cache --force
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Vercel deployment fails
✅ Check all env vars are filled
✅ GitHub repo is public
✅ No TypeScript errors locally

### Stripe test doesn't work
✅ Use test card (shown above)
✅ Don't use real card numbers!

---

## 📋 Checklist

- [ ] Supabase account created
- [ ] Database tables created
- [ ] `.env.local` filled with credentials
- [ ] `npm install` completed
- [ ] `npm run dev` runs without errors
- [ ] Landing page loads at localhost:3000
- [ ] Custom cursor visible and animated
- [ ] GitHub repo created and pushed
- [ ] Vercel project connected
- [ ] All env vars added to Vercel
- [ ] Deployment successful (green checkmark)
- [ ] Live URL working

✅ **All done = LIVE PLATFORM!**

---

## 📖 Read These Docs (in order)

1. **FILE_STRUCTURE.md** - See what files exist
2. **PROJECT_SUMMARY.md** - Full project overview
3. **README.md** - Complete documentation
4. **DEPLOYMENT.md** - Advanced setup (webhooks, custom domains)

---

## 💬 Example Workflow

```
Day 1: Setup (30 min)
- Get credentials ✅
- Fill .env.local ✅
- Create DB tables ✅
- npm run dev ✅

Day 1-2: First Deploy (15 min)
- Push to GitHub ✅
- Connect Vercel ✅
- Add env vars ✅
- Deploy ✅

Day 2+: Add Features
- Create auth pages
- Build dashboard
- Add admin panel
- Go live with users!
```

---

## 🎯 What Works NOW

✅ Landing page with animations
✅ Custom cursor effects
✅ Responsive design
✅ Modern dark theme
✅ Glass-morphism cards
✅ Gradient buttons
✅ All configurations
✅ Database structure
✅ Authentication setup
✅ Payment integration

---

## 🚀 You're Ready to Launch!

**Next action**: Read **QUICK_START.md** for detailed step-by-step guide.

Questions? See **README.md** or **DEPLOYMENT.md**.

---

**Good luck! 🏌️⛳**

Your golf charity platform is about to take off!
