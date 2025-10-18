import React from "react";
import Header from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { Loader2, Coins, ArrowUpRight, ArrowDownRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RechargePage = () => {
  const [code, setCode] = React.useState("");
  const { credits, transactions, loading, redeeming, redeemCode } = useCredits();

  const handleRedeemCode = async () => {
    if (!code.trim()) return;
    
    const result = await redeemCode(code);
    if (result.success) {
      setCode("");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "recharge":
      case "bonus":
        return <ArrowDownRight className="w-4 h-4 text-success" />;
      case "spend":
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      default:
        return <Gift className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "recharge":
      case "bonus":
        return "text-success";
      case "spend":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-6">
        <h1 className="text-3xl font-bold mb-6">💳 Recarregar Créditos</h1>

        {/* Saldo Atual */}
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">Saldo Atual</h2>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold text-primary mb-2">
                {credits?.balance || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Total adquirido: {credits?.total_purchased || 0} créditos
              </p>
            </>
          )}
        </Card>

        {/* Formulário de Resgate */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resgatar Código</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Digite o código de recarga"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1"
              disabled={redeeming}
            />
            <Button
              onClick={handleRedeemCode}
              disabled={!code.trim() || redeeming}
              className="bg-primary hover:bg-primary/90"
            >
              {redeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resgatando...
                </>
              ) : (
                "Resgatar"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Entre em contato com o suporte para obter um código de recarga
          </p>
        </Card>

        {/* Histórico de Transações */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico</h2>
          
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação ainda
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {transaction.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default RechargePage;
