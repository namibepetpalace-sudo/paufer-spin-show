import { useEffect, useState } from "react";
import { tmdbService } from "@/lib/tmdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProvidersProps {
  movieId: number;
  mediaType: 'movie' | 'tv';
}

const WatchProviders = ({ movieId, mediaType }: WatchProvidersProps) => {
  const [providers, setProviders] = useState<{
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
    link?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await tmdbService.getWatchProviders(movieId, mediaType);
        // Pegamos os dados do Brasil (BR) ou US como fallback
        const brProviders = data.results?.BR || data.results?.US;
        setProviders(brProviders);
      } catch (error) {
        console.error('Erro ao carregar provedores:', error);
        setProviders(null);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [movieId, mediaType]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onde Assistir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onde Assistir</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Informações de streaming não disponíveis para esta região.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderProviders = (providerList: WatchProvider[], title: string) => {
    if (!providerList || providerList.length === 0) return null;

    return (
      <div className="space-y-2">
        <Badge variant="secondary" className="text-xs">
          {title}
        </Badge>
        <div className="flex flex-wrap gap-2">
          {providerList.slice(0, 6).map((provider) => (
            <div
              key={provider.provider_id}
              className="flex items-center gap-2 p-2 rounded-lg bg-card border hover:bg-accent transition-colors"
            >
              <img
                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-sm font-medium">
                {provider.provider_name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Onde Assistir</CardTitle>
          {providers.link && (
            <a
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              JustWatch
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderProviders(providers.flatrate || [], "Streaming")}
        {renderProviders(providers.rent || [], "Aluguel")}
        {renderProviders(providers.buy || [], "Compra")}
        
        {!providers.flatrate && !providers.rent && !providers.buy && (
          <p className="text-muted-foreground text-sm">
            Nenhuma opção de streaming disponível no momento.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchProviders;