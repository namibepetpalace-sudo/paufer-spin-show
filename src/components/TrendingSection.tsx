import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

// Mock data for demonstration
const mockTrendingMovies = [
  {
    id: 1,
    title: "Avatar: O Caminho da Água",
    posterPath: undefined,
    rating: 8.1,
    year: "2022",
    genre: "Ficção Científica",
    type: "movie" as const
  },
  {
    id: 2,
    title: "Stranger Things",
    posterPath: undefined,
    rating: 9.2,
    year: "2023",
    genre: "Terror",
    type: "tv" as const
  },
  {
    id: 3,
    title: "Top Gun: Maverick",
    posterPath: undefined,
    rating: 8.7,
    year: "2022",
    genre: "Ação",
    type: "movie" as const
  },
  {
    id: 4,
    title: "The Last of Us",
    posterPath: undefined,
    rating: 9.0,
    year: "2023",
    genre: "Drama",
    type: "tv" as const
  },
  {
    id: 5,
    title: "Duna",
    posterPath: undefined,
    rating: 8.3,
    year: "2021",
    genre: "Ficção Científica",
    type: "movie" as const
  },
  {
    id: 6,
    title: "Wednesday",
    posterPath: undefined,
    rating: 8.5,
    year: "2022",
    genre: "Comédia",
    type: "tv" as const
  }
];

const TrendingSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-streaming-blue">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Em Alta Esta Semana</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto custom-scrollbar">
          {mockTrendingMovies.map((movie) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Ver Mais Tendências
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;