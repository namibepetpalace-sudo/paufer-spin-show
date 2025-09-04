import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { tmdbService } from "@/lib/tmdb";

const WatchlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleRemove = async (movieId: number, mediaType: string) => {
    await removeFromWatchlist(movieId, mediaType);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Watchlist</h1>
            <p className="text-muted-foreground">
              {watchlist.length} {watchlist.length === 1 ? 'item' : 'itens'} para assistir
            </p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🍿</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Sua watchlist está vazia</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Adicione filmes e séries que você quer assistir mais tarde para não esquecer!
            </p>
            <Button onClick={() => navigate('/')}>
              Explorar Catálogo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={tmdbService.getImageUrl(item.movie_poster)}
                      alt={item.movie_title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(item.movie_id, item.media_type)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
                      {item.movie_title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.media_type === 'movie' ? 'Filme' : 'Série'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;