import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Download,
  Coins,
  Gift,
  Users,
  TrendingUp
} from "lucide-react";
import { StatsCard } from "./StatsCard";

interface RechargeCode {
  id: string;
  code: string;
  credits_amount: number;
  benefits: any;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
  description: string | null;
}

export const RechargeCodesTab = () => {
  const { toast } = useToast();
  const [codes, setCodes] = React.useState<RechargeCode[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    active: 0,
    used: 0,
    totalCredits: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  // Form state
  const [creditsAmount, setCreditsAmount] = React.useState(100);
  const [quantity, setQuantity] = React.useState(1);
  const [description, setDescription] = React.useState("");
  const [validityDays, setValidityDays] = React.useState(30);
  const [maxUses, setMaxUses] = React.useState(1);
  const [benefits, setBenefits] = React.useState({
    ad_free: false,
    early_access: false,
    custom_recommendations: false,
    priority_loading: false,
    premium_badge: false,
  });

  React.useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("recharge_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCodes(data || []);
      
      // Calcular estatísticas
      const total = data?.length || 0;
      const active = data?.filter((c) => c.is_active).length || 0;
      const used = data?.filter((c) => c.current_uses >= c.max_uses).length || 0;
      const totalCredits = data?.reduce((sum, c) => sum + c.credits_amount, 0) || 0;
      
      setStats({ total, active, used, totalCredits });
    } catch (error) {
      console.error("Erro ao carregar códigos:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segments = [];
    for (let i = 0; i < 4; i++) {
      let segment = "";
      for (let j = 0; j < 4; j++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      segments.push(segment);
    }
    return `MOVA-${segments.join("-")}`;
  };

  const handleGenerateCodes = async () => {
    setGenerating(true);

    try {
      const expiresAt = validityDays > 0
        ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const selectedBenefits = Object.entries(benefits)
        .filter(([_, value]) => value)
        .reduce((acc, [key]) => ({ ...acc, [key]: true }), {});

      const newCodes = Array.from({ length: quantity }, () => ({
        code: generateCode(),
        credits_amount: creditsAmount,
        benefits: selectedBenefits,
        is_active: true,
        max_uses: maxUses,
        current_uses: 0,
        expires_at: expiresAt,
        description,
      }));

      const { error } = await supabase
        .from("recharge_codes")
        .insert(newCodes);

      if (error) throw error;

      toast({
        title: "✅ Códigos gerados!",
        description: `${quantity} código(s) criado(s) com sucesso`,
      });

      // Resetar form
      setCreditsAmount(100);
      setQuantity(1);
      setDescription("");
      setBenefits({
        ad_free: false,
        early_access: false,
        custom_recommendations: false,
        priority_loading: false,
        premium_badge: false,
      });

      loadCodes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copiado!",
      description: `Código ${code} copiado`,
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("recharge_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Código desativado" : "Código ativado",
      });

      loadCodes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Deseja realmente deletar este código?")) return;

    try {
      const { error } = await supabase
        .from("recharge_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Código deletado",
      });

      loadCodes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Códigos"
          value={stats.total}
          icon={Gift}
          trend="up"
          trendValue={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Códigos Ativos"
          value={stats.active}
          icon={ToggleRight}
          trend="neutral"
          trendValue={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Códigos Usados"
          value={stats.used}
          icon={Users}
          trend="neutral"
          trendValue={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Créditos Totais"
          value={stats.totalCredits}
          icon={Coins}
          trend="neutral"
          trendValue={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Gerador de Códigos */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🎁 Gerar Novos Códigos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Créditos por código</Label>
            <Input
              type="number"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(Number(e.target.value))}
              min={1}
            />
          </div>

          <div>
            <Label>Quantidade de códigos</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>

          <div>
            <Label>Validade (dias)</Label>
            <Input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              min={0}
              placeholder="0 = sem expiração"
            />
          </div>

          <div>
            <Label>Máximo de usos por código</Label>
            <Input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label>Descrição (interno)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Promoção Black Friday 2024"
          />
        </div>

        <div className="mb-6">
          <Label className="mb-3 block">Benefícios Incluídos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(benefits).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setBenefits({ ...benefits, [key]: checked as boolean })
                  }
                />
                <Label htmlFor={key} className="cursor-pointer">
                  {key === "ad_free" && "🚫 Sem anúncios"}
                  {key === "early_access" && "⚡ Acesso antecipado"}
                  {key === "custom_recommendations" && "🎯 Recomendações personalizadas"}
                  {key === "priority_loading" && "🚀 Carregamento prioritário"}
                  {key === "premium_badge" && "👑 Badge Premium"}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerateCodes}
          disabled={generating}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {generating ? "Gerando..." : `Gerar ${quantity} Código(s)`}
        </Button>
      </Card>

      {/* Lista de Códigos */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📋 Códigos Gerados</h3>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : codes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum código gerado ainda
          </p>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono font-bold text-lg">{code.code}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(code.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {code.credits_amount} créditos
                    </Badge>
                    <Badge variant={code.is_active ? "default" : "destructive"}>
                      {code.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <span>
                      Usos: {code.current_uses}/{code.max_uses}
                    </span>
                    {code.expires_at && (
                      <span>
                        Expira: {new Date(code.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {code.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {code.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(code.id, code.is_active)}
                  >
                    {code.is_active ? (
                      <ToggleRight className="w-5 h-5 text-success" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCode(code.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
