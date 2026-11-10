-- ========================================================
-- GYMPULSE INDIA - PRODUCTION POSTGRESQL & RLS SCHEMA
-- SAC Code: 999723 (Gym & Fitness Centre Services, 18% GST)
-- ========================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'expiring_soon', 'expired', 'frozen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('created', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    avatar_url TEXT,
    age INT,
    gender VARCHAR(20),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    fitness_level VARCHAR(30) DEFAULT 'beginner',
    fitness_goal VARCHAR(50) DEFAULT 'general_fitness',
    limitations TEXT,
    emergency_contact JSONB,
    assigned_trainer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membership Plans Table
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL DEFAULT 1,
    duration_days INT NOT NULL DEFAULT 30,
    base_price_inr NUMERIC(10,2) NOT NULL,
    app_discount_price_inr NUMERIC(10,2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Memberships Table
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status membership_status NOT NULL DEFAULT 'active',
    amount_paid_inr NUMERIC(10,2) NOT NULL,
    is_auto_renew BOOLEAN DEFAULT FALSE,
    freeze_days_remaining INT DEFAULT 15,
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments & Razorpay Transactions Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    membership_id UUID REFERENCES public.memberships(id),
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    amount_inr NUMERIC(10,2) NOT NULL,
    gst_amount_inr NUMERIC(10,2) NOT NULL, -- 18% GST (CGST 9% + SGST 9%)
    method VARCHAR(30) DEFAULT 'upi',
    status payment_status NOT NULL DEFAULT 'created',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GST Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES public.payments(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    subtotal_inr NUMERIC(10,2) NOT NULL,
    cgst_inr NUMERIC(10,2) NOT NULL,
    sgst_inr NUMERIC(10,2) NOT NULL,
    total_inr NUMERIC(10,2) NOT NULL,
    sac_code VARCHAR(20) DEFAULT '999723',
    gym_gstin VARCHAR(30) DEFAULT '27AAAAA0000A1Z5',
    invoice_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rotating QR Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    method VARCHAR(30) DEFAULT 'qr_scan',
    streak_count INT DEFAULT 1,
    location_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Exercises Catalog Table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    difficulty VARCHAR(30) DEFAULT 'beginner',
    instructions JSONB DEFAULT '[]'::jsonb,
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Workouts & Routines Table
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 45,
    difficulty VARCHAR(30) DEFAULT 'intermediate',
    target_muscle VARCHAR(100),
    created_by_role user_role DEFAULT 'trainer',
    trainer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Workout Routine Exercises (Junction Table)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id),
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT NOT NULL DEFAULT 3,
    target_reps VARCHAR(30) DEFAULT '8-12',
    rest_seconds INT DEFAULT 60
);

-- 10. Workout Logs & PRs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.set_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id),
    set_number INT NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    reps INT NOT NULL,
    is_pr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: Members read/write own; Trainers read assigned; Admins read/write all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 2. Plans: Anyone can view active plans; Only Admins can modify
CREATE POLICY "Public read active plans" ON public.membership_plans
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin manage plans" ON public.membership_plans
    FOR ALL USING (public.is_admin());

-- 3. Memberships: User can view own; Admin can manage all
CREATE POLICY "Members view own membership" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin manage memberships" ON public.memberships
    FOR ALL USING (public.is_admin());

-- 4. Attendance: User view own attendance; Admin view all
CREATE POLICY "Members view own attendance" ON public.attendance
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Members record checkin" ON public.attendance
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 5. Exercises & Workouts: Public read; Trainers and Admins can create
CREATE POLICY "Public read exercises" ON public.exercises
    FOR SELECT USING (TRUE);

CREATE POLICY "Trainers and Admins manage workouts" ON public.workouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('trainer', 'admin')
        )
    );
