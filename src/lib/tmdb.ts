const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d';
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
    try {
      const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=pt-BR`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`TMDb API error: ${response.status} - ${response.statusText}`);
        throw new Error(`TMDb API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from TMDb:', error);
      throw error;
    }
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

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb(`/discover/movie?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`);
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

  async getWatchProviders(id: number, type: 'movie' | 'tv'): Promise<any> {
    return this.fetchFromTMDb(`/${type}/${id}/watch/providers`);
  }

  async getMovieTrailers(id: number): Promise<any> {
    return this.fetchFromTMDb(`/movie/${id}/videos`);
  }

  async getTVTrailers(id: number): Promise<any> {
    return this.fetchFromTMDb(`/tv/${id}/videos`);
  }

  async getTopRatedMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/movie/top_rated');
    return data.results;
  }

  async getUpcomingMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/movie/upcoming');
    return data.results;
  }

  async getNowPlayingMovies(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/movie/now_playing');
    return data.results;
  }

  async getTopRatedTVShows(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/tv/top_rated');
    return data.results;
  }

  async getAiringTodayTVShows(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/tv/airing_today');
    return data.results;
  }

  async getOnTheAirTVShows(): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb('/tv/on_the_air');
    return data.results;
  }

  async getDiscoverMoviesByGenre(genreId: number): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb(`/discover/movie?with_genres=${genreId}`);
    return data.results;
  }

  async getDiscoverTVByGenre(genreId: number): Promise<TMDbMovie[]> {
    const data = await this.fetchFromTMDb(`/discover/tv?with_genres=${genreId}`);
    return data.results;
  }

  getYouTubeTrailerUrl(key: string): string {
    return `https://www.youtube.com/embed/${key}`;
  }

  async getTrendingWithPagination(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<{ results: TMDbMovie[], total_pages: number }> {
    const data = await this.fetchFromTMDb(`/trending/all/${timeWindow}?page=${page}`);
    return { results: data.results, total_pages: data.total_pages };
  }

  // Advanced filtering methods with multiple page support
  async searchByFilters(filters: {
    mediaType?: string;
    genre?: string;
    year?: string;
    rating?: string;
    category?: string;
  }, maxResults: number = 1000): Promise<{ results: TMDbMovie[], totalResults: number, totalPages: number }> {
    let endpoint = '';
    let params = [];

    // Determine base endpoint
    if (filters.mediaType === 'movie') {
      if (filters.category === 'popular') endpoint = '/movie/popular';
      else if (filters.category === 'top_rated') endpoint = '/movie/top_rated';
      else if (filters.category === 'now_playing') endpoint = '/movie/now_playing';
      else if (filters.category === 'upcoming') endpoint = '/movie/upcoming';
      else endpoint = '/discover/movie';
    } else if (filters.mediaType === 'tv') {
      if (filters.category === 'popular') endpoint = '/tv/popular';
      else if (filters.category === 'top_rated') endpoint = '/tv/top_rated';
      else if (filters.category === 'now_playing') endpoint = '/tv/airing_today';
      else endpoint = '/discover/tv';
    } else if (filters.mediaType === 'anime') {
      endpoint = '/discover/tv';
      params.push('with_keywords=210024'); // Anime keyword
    } else if (filters.mediaType === 'documentary') {
      endpoint = '/discover/movie';
      params.push('with_genres=99'); // Documentary genre
    } else if (filters.mediaType === 'korean') {
      endpoint = '/discover/tv';
      params.push('with_original_language=ko'); // Korean dramas
    } else if (filters.mediaType === 'bollywood') {
      endpoint = '/discover/movie';
      params.push('with_original_language=hi'); // Hindi movies
    } else if (filters.mediaType === 'chinese') {
      endpoint = '/discover/tv';
      params.push('with_original_language=zh'); // Chinese dramas
    } else {
      endpoint = '/discover/movie'; // Default
    }

    // Add genre filter
    if (filters.genre && !endpoint.includes('popular') && !endpoint.includes('top_rated') && !endpoint.includes('now_playing') && !endpoint.includes('upcoming') && !endpoint.includes('airing_today')) {
      params.push(`with_genres=${filters.genre}`);
    }

    // Add year filter
    if (filters.year) {
      if (filters.mediaType === 'tv' || filters.mediaType === 'anime' || filters.mediaType === 'korean' || filters.mediaType === 'chinese') {
        params.push(`first_air_date_year=${filters.year}`);
      } else {
        params.push(`primary_release_year=${filters.year}`);
      }
    }

    // Add rating filter
    if (filters.rating) {
      params.push(`vote_average.gte=${filters.rating}`);
    }

    // Add sort by popularity
    if (!endpoint.includes('popular') && !endpoint.includes('top_rated') && !endpoint.includes('now_playing') && !endpoint.includes('upcoming') && !endpoint.includes('airing_today')) {
      params.push('sort_by=popularity.desc');
    }

    // Calculate how many pages to fetch
    const resultsPerPage = 20; // TMDb returns 20 results per page
    const maxPages = Math.min(Math.ceil(maxResults / resultsPerPage), 50); // TMDb limits to 1000 pages, but we'll use 50 for performance

    // Construct base URL
    const baseEndpoint = params.length > 0 ? `${endpoint}?${params.join('&')}` : endpoint;
    
    // Fetch multiple pages in parallel
    const pagePromises = [];
    for (let page = 1; page <= maxPages; page++) {
      const pageEndpoint = `${baseEndpoint}${baseEndpoint.includes('?') ? '&' : '?'}page=${page}`;
      pagePromises.push(this.fetchFromTMDb(pageEndpoint));
    }

    try {
      const responses = await Promise.all(pagePromises);
      
      // Combine all results
      let allResults: TMDbMovie[] = [];
      let totalResults = 0;
      let totalPages = 0;
      
      responses.forEach((data, index) => {
        if (data && data.results) {
          allResults = allResults.concat(data.results);
          if (index === 0) {
            totalResults = data.total_results;
            totalPages = data.total_pages;
          }
        }
      });

      // Remove duplicates based on ID
      const uniqueResults = allResults.reduce((unique, movie) => {
        const existingMovie = unique.find(m => m.id === movie.id);
        if (!existingMovie) {
          unique.push(movie);
        }
        return unique;
      }, [] as TMDbMovie[]);

      // Limit to maxResults
      const limitedResults = uniqueResults.slice(0, maxResults);

      return {
        results: limitedResults,
        totalResults: Math.min(totalResults, uniqueResults.length),
        totalPages: totalPages
      };
    } catch (error) {
      console.error('Error fetching multiple pages:', error);
      // Fallback to single page
      const data = await this.fetchFromTMDb(baseEndpoint);
      return {
        results: data.results || [],
        totalResults: data.total_results || 0,
        totalPages: data.total_pages || 0
      };
    }
  }

  async getAnimeContent(maxResults: number = 500): Promise<{ results: TMDbMovie[], totalResults: number }> {
    // Enhanced anime search using multiple strategies
    const strategies = [
      '/discover/tv?with_keywords=210024&sort_by=popularity.desc', // Anime keyword
      '/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc', // Japanese animation
      '/discover/tv?with_keywords=257106&sort_by=popularity.desc', // Manga adaptation
      '/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc', // Japanese animated movies
    ];

    const resultsPerPage = 20;
    const pagesPerStrategy = Math.ceil(maxResults / (strategies.length * resultsPerPage));
    
    const allPromises = [];
    
    for (const strategy of strategies) {
      for (let page = 1; page <= pagesPerStrategy; page++) {
        const endpoint = `${strategy}&page=${page}`;
        allPromises.push(this.fetchFromTMDb(endpoint));
      }
    }

    try {
      const responses = await Promise.all(allPromises);
      let allResults: TMDbMovie[] = [];
      
      responses.forEach(data => {
        if (data && data.results) {
          allResults = allResults.concat(data.results);
        }
      });

      // Remove duplicates and limit results
      const uniqueResults = allResults.reduce((unique, movie) => {
        const existingMovie = unique.find(m => m.id === movie.id);
        if (!existingMovie) {
          unique.push(movie);
        }
        return unique;
      }, [] as TMDbMovie[]);

      return {
        results: uniqueResults.slice(0, maxResults),
        totalResults: uniqueResults.length
      };
    } catch (error) {
      console.error('Error fetching anime content:', error);
      const fallback = await this.fetchFromTMDb('/discover/tv?with_keywords=210024&sort_by=popularity.desc');
      return {
        results: fallback.results || [],
        totalResults: fallback.total_results || 0
      };
    }
  }

  async getDocumentaries(maxResults: number = 500): Promise<{ results: TMDbMovie[], totalResults: number }> {
    const resultsPerPage = 20;
    const maxPages = Math.ceil(maxResults / resultsPerPage);
    
    const pagePromises = [];
    for (let page = 1; page <= maxPages; page++) {
      pagePromises.push(this.fetchFromTMDb(`/discover/movie?with_genres=99&sort_by=popularity.desc&page=${page}`));
    }

    try {
      const responses = await Promise.all(pagePromises);
      let allResults: TMDbMovie[] = [];
      
      responses.forEach(data => {
        if (data && data.results) {
          allResults = allResults.concat(data.results);
        }
      });

      return {
        results: allResults.slice(0, maxResults),
        totalResults: allResults.length
      };
    } catch (error) {
      console.error('Error fetching documentaries:', error);
      const fallback = await this.fetchFromTMDb('/discover/movie?with_genres=99&sort_by=popularity.desc');
      return {
        results: fallback.results || [],
        totalResults: fallback.total_results || 0
      };
    }
  }

  async getKoreanDramas(maxResults: number = 500): Promise<{ results: TMDbMovie[], totalResults: number }> {
    const resultsPerPage = 20;
    const maxPages = Math.ceil(maxResults / resultsPerPage);
    
    const pagePromises = [];
    for (let page = 1; page <= maxPages; page++) {
      pagePromises.push(this.fetchFromTMDb(`/discover/tv?with_original_language=ko&sort_by=popularity.desc&page=${page}`));
    }

    try {
      const responses = await Promise.all(pagePromises);
      let allResults: TMDbMovie[] = [];
      
      responses.forEach(data => {
        if (data && data.results) {
          allResults = allResults.concat(data.results);
        }
      });

      return {
        results: allResults.slice(0, maxResults),
        totalResults: allResults.length
      };
    } catch (error) {
      console.error('Error fetching Korean dramas:', error);
      const fallback = await this.fetchFromTMDb('/discover/tv?with_original_language=ko&sort_by=popularity.desc');
      return {
        results: fallback.results || [],
        totalResults: fallback.total_results || 0
      };
    }
  }
}

export const tmdbService = new TMDbService();