import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, RefreshCw, Eye, Clock } from "lucide-react";
import MovieCard from "./MovieCard";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { usePersonalization } from "@/hooks/usePersonalization";

const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState<TMDbMovie[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { preferences, getPersonalizedRecommendations, addToWatchHistory } = usePersonalization();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        tmdbService.getMovieGenres(),
        tmdbService.getTVGenres()
      ]);
      setGenres([...movieGenres, ...tvGenres]);

      let finalRecommendations: TMDbMovie[] = [];

      // Se o usuário tem preferências, usar algoritmo personalizado
      if (user && preferences?.favorite_genres?.length) {
        const personalizedIds = await getPersonalizedRecommendations();
        
        // Buscar filmes dos gêneros favoritos
        const genreBasedMovies = await Promise.all(
          preferences.favorite_genres.slice(0, 3).map(genreId => 
            tmdbService.getMoviesByGenre(genreId)
          )
        );

        // Combinar filmes baseados em gêneros com comportamento
        const genreMovies = genreBasedMovies.flat().slice(0, 8);
        
        // Filtrar filmes já vistos e misturar
        const unseenMovies = genreMovies.filter(movie => 
          !personalizedIds.includes(movie.id)
        );

        finalRecommendations = unseenMovies
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
      }

      // Fallback para usuários sem preferências ou quando não há filmes suficientes
      if (finalRecommendations.length < 6) {
        const [popular, topRated, trending] = await Promise.all([
          tmdbService.getPopularMovies(),
          tmdbService.getTopRatedMovies(),
          tmdbService.getTrendingWithPagination('week', 1)
        ]);

        const mixed = [
          ...popular.slice(0, 3),
          ...topRated.slice(0, 3),
          ...trending.results.slice(0, 3)
        ].sort(() => Math.random() - 0.5);

        // Completar com filmes genéricos se necessário
        finalRecommendations = [
          ...finalRecommendations,
          ...mixed.filter(movie => 
            !finalRecommendations.some(rec => rec.id === movie.id)
          )
        ].slice(0, 6);
      }

      setRecommendations(finalRecommendations);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-purple-600 animate-pulse">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                {user ? 'Recomendado Para Você' : 'Recomendações Populares'}
              </h2>
              <p className="text-muted-foreground">
                {user ? 'Baseado no seu gosto e tendências' : 'O que está bombando agora'}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRecommendations}
            disabled={refreshing}
            className="border-border hover:bg-card group"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
            Atualizar
          </Button>
        </div>

        {/* Métricas de Engajamento */}
        {user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-500">47</div>
                <div className="text-xs text-muted-foreground">Filmes Vistos</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-500">127h</div>
                <div className="text-xs text-muted-foreground">Tempo Assistido</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-500">89%</div>
                <div className="text-xs text-muted-foreground">Match Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-lg font-bold text-red-500">Drama</div>
                <div className="text-xs text-muted-foreground">Gênero Favorito</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA de Onboarding para usuários não logados */}
        {!user && (
          <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20 mb-8">
            <CardContent className="p-6 text-center">
              <div className="max-w-md mx-auto">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-bold mb-2">Obtenha Recomendações Personalizadas!</h3>
                <p className="text-muted-foreground mb-4">
                  Faça login para receber sugestões baseadas no seu gosto e histórico de visualização.
                </p>
                <Button className="bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300">
                  Criar Conta Grátis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Recomendações */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Loading skeleton com animação
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl h-64 mb-3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            ))
          ) : (
            recommendations.map((movie, index) => (
              <div 
                key={movie.id} 
                className="animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard
                  id={movie.id}
                  title={tmdbService.getTitle(movie)}
                  posterPath={movie.poster_path}
                  rating={movie.vote_average}
                  year={tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie))}
                  genre={tmdbService.getGenreName(movie.genre_ids, genres)}
                  type={tmdbService.getMediaType(movie)}
                  movie={movie}
                  onView={() => addToWatchHistory(movie)}
                />
              </div>
            ))
          )}
        </div>

        {/* CTA para Ver Mais */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300"
            onClick={() => window.location.href = '/trending'}
          >
            Ver Todas as Tendências
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;