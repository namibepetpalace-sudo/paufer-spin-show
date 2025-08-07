const TMDB_API_KEY = '026a48f6c5e85101159fc283a52963ff';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

export interface TMDbGenre {
  id: number;
  name: string;
}

class TMDbService {
  private async fetchFromTMDb(endpoint: string): Promise<any> {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR`);
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb(`/trending/all/${timeWindow}`);
    return data.results;
  }

  async getPopularMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/movie/popular');
    return data.results;
  }

  async getPopularTVShows(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/tv/popular');
    return data.results;
  }

  async searchMovies(query: string): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb(`/search/multi?query=${encodeURIComponent(query)}`);
    return data.results;
  }

  async getMovieGenres(): Promise<TMDbGenre[]> {
    const data = await this.fetchFromTMDb('/genre/movie/list');
    return data.genres;
  }

  async getTVGenres(): Promise<TMDbGenre[]> {
    const data = await this.fetchFromTMDb('/genre/tv/list');
    return data.genres;
  }

  async getMovieDetails(id: number): Promise<any> {
    return this.fetchFromTMDb(`/movie/${id}`);
  }

  async getTVDetails(id: number): Promise<any> {
    return this.fetchFromTMDb(`/tv/${id}`);
  }

  getImageUrl(path: string | null): string {
    if (!path) return `https://via.placeholder.com/300x450/1a1a2e/eee?text=Sem+Imagem`;
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }

  getGenreName(genreIds: number[], allGenres: TMDbGenre[]): string {
    if (!genreIds || genreIds.length === 0) return 'Sem gênero';
    const genre = allGenres.find(g => g.id === genreIds[0]);
    return genre ? genre.name : 'Sem gênero';
  }

  formatReleaseYear(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).getFullYear().toString();
  }

  getTitle(item: TMDbMovie): string {
    return item.title || item.name || 'Título não disponível';
  }

  getReleaseDate(item: TMDbMovie): string {
    return item.release_date || item.first_air_date || '';
  }

  getMediaType(item: TMDbMovie): 'movie' | 'tv' {
    if (item.media_type) return item.media_type;
    return item.title ? 'movie' : 'tv';
  }
}

export const tmdbService = new TMDbService();