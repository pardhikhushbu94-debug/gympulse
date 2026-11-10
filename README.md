# 🏋️ GymPulse — Production Gym Management & Fitness App

> A full-stack, cross-platform mobile and web application built for local gyms in India. Runs seamlessly on **Web, Android, and iOS from one single codebase**.

Designed with an energetic, athletic **Carbon & Volt** theme (Dark & Light modes), compliant with **Indian GST laws (SAC Code 999723)**, **UPI-first checkout (Razorpay)**, **Anti-fraud rotating TOTP QR attendance**, and the **India Digital Personal Data Protection (DPDP) Act 2023**.

---

## 📱 User Roles & Capabilities

### 1. 🥇 Members
- **Onboarding & Auth:** Sign up with Phone OTP, Email/Password, or Google sign-in.
- **Membership Passes:** Purchase, renew, upgrade, or pause (freeze) memberships (Monthly, 3-Month, 6-Month, Annual, Day Passes).
- **Anti-Fraud QR Check-in:** Scan 30-second rotating TOTP QR codes at the gym desk with 50-meter GPS geofencing verification.
- **Guided Workout Player:** Step-by-step set logging, interactive micro-steppers for reps/weights, personal record (PR) celebration banner, and rest timer.
- **Desi Nutrition & Hydration Hub:** 100% Indian Veg vs. Non-Veg meal plans (Soya chunks, Sattu, Paneer, Chaas, Chicken tikka), interactive water tracker (`+1 Glass` / `-1 Glass`), and medical disclaimer.
- **Periodized Programs:** 12-Week Lean Recomposition, 8-Week Fat Incinerator, 4-Week Strength Awakening with week-by-week syllabus breakdown.
- **Studio Group Classes:** Book spots or join waitlists for Yoga, Zumba, HIIT, and Crossfit with a 2-hour cancellation policy.
- **In-App Notification Center:** Push notifications, daily workout reminders (`06:30 AM`), quiet hours (`10:00 PM – 07:00 AM`), and expiry alerts.

### 2. 🥋 Trainers
- **Client Assessment Dossier:** Monitor assigned members' attendance consistency, weight delta, body measurements, and 1RM personal records.
- **Private Coach Notes:** Log private assessment notes with date stamps.
- **Resumable Video Uploader:** Chunked background video uploader for workout tutorials, mobility flows, and technique breakdowns.
- **1-on-1 Chat:** Messaging with members featuring quick coaching suggestions and simulated replies.
- **Earnings Summary:** Real-time visibility into personal training commissions (e.g. ₹48,300/mo).

### 3. 🏢 Gym Owner / Admin Console
- **Multi-Period Financials:** Revenue analytics across Today, Week, Month, Q3, and Annual periods with YoY growth indicators.
- **GST Invoicing & Accounting CSV Export:** Automatic 18% GST calculation (CGST 9% + SGST 9%) under SAC 999723 with downloadable CSV reports.
- **Member Roster & Dues:** Search members, filter by status (Active, Expiring in 7 Days, Expired, Frozen), and send 1-click WhatsApp UPI renewal links.
- **Offline Walk-In Billing:** Record cash, cheque, counter UPI, or POS card payments and immediately activate passes.
- **Promotional Coupons:** Issue percent or flat ₹ discount codes (e.g. `APPUSER15`, `DIWALI2026`) with usage limits and active switches.
- **Gym & Geofence Settings:** Manage GSTIN, UPI Merchant VPA, entrance GPS coordinates, tolerance radius, and TOTP rotation speed.
- **Immutable Audit Trail:** Chronological security log of cashier collections, coupon issuances, and setting modifications.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo SDK 58](https://expo.dev/)
- **Routing:** [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-system based navigation)
- **Web Build:** React Native Web (fully responsive, desktop & mobile web)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Server Cache:** [TanStack Query](https://tanstack.com/query) (React Query)
- **Backend / Database:** [Supabase](https://supabase.com/) (Postgres with Row Level Security, Auth, Storage, Edge Functions)
- **Payments:** [Razorpay](https://razorpay.com/) (UPI, GPay, PhonePe, Cards, Netbanking & Subscriptions) with server-side HMAC-SHA256 webhook verification
- **Icons & Theme:** [Lucide React Native](https://lucide.dev/), semantic token-driven design system with WCAG AA compliance

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js:** v18 or higher (tested on Node v23)
- **Package Manager:** npm or bun

### 2. Installation
```bash
git clone https://github.com/your-username/gympulse.git
cd Project_GyM
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the keys with your Supabase URL, Anon Key, and Razorpay Key ID.

### 4. Start Development Server
```bash
# Starts the Expo dev server for Web, iOS, and Android:
npx expo start

# Open Web directly:
npx expo start --web
```
Open `http://localhost:8081` in your browser.

---

## 🧪 Testing & Verification Commands

```bash
# Typecheck TypeScript across all screens and services:
npx tsc --noEmit

# Export standalone web bundle (compiles all 38 route bundles to dist/):
npx expo export -p web

# Verify dependencies and configuration:
npx expo-doctor
```

---

## 📦 Building for Production with EAS

### Android (Google Play AAB / Standalone APK)
```bash
# Build production Android App Bundle:
npx eas-cli@latest build --platform android --profile production

# Build standalone APK for internal testing:
npx eas-cli@latest build --platform android --profile preview
```

### iOS (Apple App Store / TestFlight)
```bash
# Build production IPA for App Store submission:
npx eas-cli@latest build --platform ios --profile production
```

### Web Deployment (Vercel / Netlify)
```bash
# Build static web distribution:
npx expo export -p web

# Deploy dist/ folder directly to Vercel or Netlify:
npx vercel deploy dist/ --prod
```

---

## 🔒 Security, Compliance & Invoicing

- **India DPDP Act 2023:** Complete user data sovereignty with instant account and metrics erasure in [`src/app/privacy.tsx`](src/app/privacy.tsx).
- **GST SAC Code 999723:** Standard Indian GST classification for physical fitness centres (18% GST: CGST 9% + SGST 9%). Invoices reflect gym legal name, customer details, taxable base, and tax split.
- **HMAC SHA-256 Webhooks:** Server-side payment verification implemented in [`supabase/functions/razorpay-webhook/index.ts`](supabase/functions/razorpay-webhook/index.ts). Never trusts client payment states.

---

## 📄 License
This project is licensed under the MIT License.
