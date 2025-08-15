import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import { tmdbService, TMDbMovie, TMDbGenre } from "@/lib/tmdb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TrendingPage = () => {
  const [trendingMovies, setTrendingMovies] = useState<TMDbMovie[]>([]);
  const [genres, setGenres] = useState<TMDbGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const navigate = useNavigate();

  useEffect(() => {
    loadTrendingData();
  }, [timeWindow]);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const [trending, movieGenres, tvGenres] = await Promise.all([
        tmdbService.getTrendingWithPagination(timeWindow, 1),
        tmdbService.getMovieGenres(),
        tmdbService.getTVGenres()
      ]);
      
      setTrendingMovies(trending.results);
      setTotalPages(trending.total_pages);
      setCurrentPage(1);
      setGenres([...movieGenres, ...tvGenres]);
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (currentPage >= totalPages || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const trending = await tmdbService.getTrendingWithPagination(timeWindow, nextPage);
      setTrendingMovies(prev => [...prev, ...trending.results]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Erro ao carregar mais filmes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header da Página */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-border hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-streaming-blue">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Tendências</h1>
                <p className="text-muted-foreground">Os mais populares agora</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={timeWindow} onValueChange={(value: 'day' | 'week') => setTimeWindow(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Hoje</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="week">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Esta Semana</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid de Filmes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl h-80 mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))
          ) : (
            trendingMovies.map((movie) => (
              <div key={movie.id} className="animate-fade-in">
                <MovieCard
                  id={movie.id}
                  title={tmdbService.getTitle(movie)}
                  posterPath={movie.poster_path}
                  rating={movie.vote_average}
                  year={tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie))}
                  genre={tmdbService.getGenreName(movie.genre_ids, genres)}
                  type={tmdbService.getMediaType(movie)}
                  movie={movie}
                />
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {currentPage < totalPages && !loading && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={loadMoreMovies}
              disabled={loadingMore}
            >
              {loadingMore ? 'Carregando...' : 'Carregar Mais Tendências'}
            </Button>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 p-6 rounded-xl bg-card border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{trendingMovies.length}</div>
              <div className="text-sm text-muted-foreground">Itens Carregados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{totalPages}</div>
              <div className="text-sm text-muted-foreground">Total de Páginas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {timeWindow === 'day' ? 'Diário' : 'Semanal'}
              </div>
              <div className="text-sm text-muted-foreground">Período</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrendingPage;