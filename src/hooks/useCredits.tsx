import React from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Credits {
  balance: number;
  total_purchased: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  balance_after: number;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = React.useState<Credits | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [redeeming, setRedeeming] = React.useState(false);

  const loadCredits = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setCredits(data || { balance: 0, total_purchased: 0, total_spent: 0 });
    } catch (error) {
      console.error("Erro ao carregar créditos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadTransactions = React.useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  }, [user]);

  React.useEffect(() => {
    loadCredits();
    loadTransactions();
  }, [loadCredits, loadTransactions]);

  const redeemCode = async (code: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para resgatar códigos",
        variant: "destructive",
      });
      return { success: false };
    }

    setRedeeming(true);

    try {
      const { data, error } = await supabase.functions.invoke("redeem-code", {
        body: { code },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao resgatar código",
          description: data.error,
          variant: "destructive",
        });
        return { success: false };
      }

      toast({
        title: "🎉 Código resgatado!",
        description: `Você recebeu ${data.credits_added} créditos!`,
      });

      // Recarregar dados
      await loadCredits();
      await loadTransactions();

      return { success: true, data };
    } catch (error: any) {
      console.error("Erro ao resgatar código:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao resgatar código",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setRedeeming(false);
    }
  };

  return {
    credits,
    transactions,
    loading,
    redeeming,
    redeemCode,
    refreshCredits: loadCredits,
    refreshTransactions: loadTransactions,
  };
};
