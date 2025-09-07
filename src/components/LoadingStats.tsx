import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Film, Tv, Star } from "lucide-react";

interface LoadingStatsProps {
  isLoading: boolean;
  resultCount?: number;
  totalPages?: number;
  searchType?: string;
}

const LoadingStats = ({ isLoading, resultCount, totalPages, searchType }: LoadingStatsProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState("");

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const phases = [
        "Iniciando busca...",
        "Buscando na página 1...",
        "Carregando múltiplas páginas...",
        "Processando resultados...",
        "Removendo duplicatas...",
        "Finalizando..."
      ];
      
      let currentPhase = 0;
      const interval = setInterval(() => {
        if (currentPhase < phases.length) {
          setLoadingPhase(phases[currentPhase]);
          setProgress((currentPhase + 1) * (100 / phases.length));
          currentPhase++;
        } else {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setLoadingPhase("Concluído!");
    }
  }, [isLoading]);

  if (!isLoading && !resultCount) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <span>Status da Busca Avançada</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{loadingPhase}</span>
                  <span className="text-primary font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Film className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">Múltiplas Páginas</div>
                  <div className="text-xs text-muted-foreground">Até 50 páginas</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Tv className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">Máx. Resultados</div>
                  <div className="text-xs text-muted-foreground">1000 itens</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Star className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">Sem Duplicatas</div>
                  <div className="text-xs text-muted-foreground">Filtro automático</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-medium">Ordenação</div>
                  <div className="text-xs text-muted-foreground">Por popularidade</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {resultCount?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {searchType ? `${searchType} encontrados` : 'resultados encontrados'}
              </div>
              {totalPages && (
                <div className="text-xs text-muted-foreground">
                  Dados de {Math.min(totalPages, 50)} páginas processadas
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingStats;