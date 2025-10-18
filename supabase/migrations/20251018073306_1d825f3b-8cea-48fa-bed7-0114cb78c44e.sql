-- FASE 1: Sistema de Créditos e Códigos de Recarga

-- Tabela de créditos dos usuários
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
ON public.user_credits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits"
ON public.user_credits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage credits"
ON public.user_credits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de códigos de recarga
CREATE TABLE public.recharge_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    credits_amount INTEGER NOT NULL,
    benefits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

CREATE INDEX idx_recharge_codes_code ON public.recharge_codes(code);
CREATE INDEX idx_recharge_codes_active ON public.recharge_codes(is_active);
CREATE INDEX idx_recharge_codes_expires ON public.recharge_codes(expires_at);

ALTER TABLE public.recharge_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage codes"
ON public.recharge_codes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de resgates de códigos
CREATE TABLE public.code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id UUID REFERENCES public.recharge_codes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credits_added INTEGER NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    UNIQUE (code_id, user_id)
);

CREATE INDEX idx_redemptions_user ON public.code_redemptions(user_id);
CREATE INDEX idx_redemptions_code ON public.code_redemptions(code_id);

ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
ON public.code_redemptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
ON public.code_redemptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tipo de transação
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'spend', 'refund', 'bonus');

-- Tabela de transações de créditos
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type public.transaction_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_transactions_created ON public.credit_transactions(created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Atualizar tabela profiles com campos premium
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_benefits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_profiles_premium ON public.profiles(is_premium) WHERE is_premium = true;