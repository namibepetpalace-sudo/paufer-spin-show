import React from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PremiumBenefits {
  ad_free?: boolean;
  early_access?: boolean;
  custom_recommendations?: boolean;
  priority_loading?: boolean;
  premium_badge?: boolean;
}

export const usePremiumStatus = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = React.useState(false);
  const [benefits, setBenefits] = React.useState<PremiumBenefits>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPremiumStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_premium, premium_benefits, premium_expires_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const isActive =
            data.is_premium &&
            (!data.premium_expires_at ||
              new Date(data.premium_expires_at) > new Date());

          setIsPremium(isActive);
          setBenefits((data.premium_benefits as PremiumBenefits) || {});
        }
      } catch (error) {
        console.error("Erro ao carregar status premium:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPremiumStatus();
  }, [user]);

  const hasFeature = (feature: keyof PremiumBenefits) => {
    return isPremium && benefits[feature] === true;
  };

  return {
    isPremium,
    benefits,
    loading,
    hasFeature,
  };
};
