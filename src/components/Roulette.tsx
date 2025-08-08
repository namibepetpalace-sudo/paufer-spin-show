import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Sparkles } from "lucide-react";
import { tmdbService, TMDbMovie } from "@/lib/tmdb";

interface RouletteMovie {
  id: number;
  title: string;
  poster: string;
  year: string;
  color: string;
}

const Roulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RouletteMovie | null>(null);
  const [rotation, setRotation] = useState(0);
  const [rouletteItems, setRouletteItems] = useState<RouletteMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = [
    "from-netflix-red to-red-600",
    "from-netflix-red/80 to-orange-600", 
    "from-netflix-red/60 to-red-700",
    "from-netflix-red/90 to-red-800",
    "from-netflix-red/70 to-red-500",
    "from-netflix-red/85 to-pink-600",
    "from-netflix-red/75 to-gray-700",
    "from-netflix-red/65 to-orange-700",
  ];

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const popularMovies = await tmdbService.getPopularMovies();
        const moviesForRoulette = popularMovies.slice(0, 8).map((movie: TMDbMovie, index: number) => ({
          id: movie.id,
          title: tmdbService.getTitle(movie),
          poster: tmdbService.getImageUrl(movie.poster_path),
          year: tmdbService.formatReleaseYear(tmdbService.getReleaseDate(movie)),
          color: colors[index] || colors[0]
        }));
        setRouletteItems(moviesForRoulette);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const spinRoulette = () => {
    if (isSpinning || rouletteItems.length === 0) return;
    
    setIsSpinning(true);
    setSelectedItem(null);
    
    // Calculate random rotation (3-5 full spins + random position)
    const baseRotation = rotation;
    const spins = Math.floor(Math.random() * 3) + 3; // 3-5 spins
    const randomPosition = Math.random() * 360;
    const newRotation = baseRotation + (spins * 360) + randomPosition;
    
    setRotation(newRotation);
    
    // Calculate which item was selected
    const normalizedPosition = (360 - (newRotation % 360)) % 360;
    const itemAngle = 360 / rouletteItems.length;
    const selectedIndex = Math.floor(normalizedPosition / itemAngle);
    
    setTimeout(() => {
      setSelectedItem(rouletteItems[selectedIndex]);
      setIsSpinning(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-8">
        <div className="w-80 h-80 rounded-full bg-netflix-dark animate-pulse flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-netflix-red animate-spin" />
        </div>
        <p className="text-foreground">Carregando filmes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Roulette Wheel */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-netflix-red glow-effect"></div>
        </div>
        
        {/* Wheel */}
        <div 
          className="relative w-80 h-80 rounded-full overflow-hidden shadow-2xl glow-effect"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {rouletteItems.map((item, index) => {
            const angle = (360 / rouletteItems.length) * index;
            const nextAngle = (360 / rouletteItems.length) * (index + 1);
            
            return (
              <div
                key={item.id}
                className={`absolute w-full h-full bg-gradient-to-r ${item.color}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute flex flex-col items-center text-white text-xs font-semibold"
                  style={{
                    top: '25%',
                    left: '55%',
                    transform: `rotate(${angle + (360 / rouletteItems.length) / 2}deg)`,
                    transformOrigin: '0 100%',
                    width: '90px'
                  }}
                >
                  <img 
                    src={item.poster} 
                    alt={item.title}
                    className="w-8 h-12 object-cover rounded mb-1 shadow-lg"
                  />
                  <span className="text-center leading-tight">{item.title}</span>
                  <span className="text-xs opacity-80">({item.year})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Spin Button */}
      <Button
        onClick={spinRoulette}
        disabled={isSpinning}
        size="lg"
        className="bg-netflix-red text-white border-0 hover:bg-netflix-red/90 glow-effect px-8 py-3 transition-all duration-300 hover:scale-105"
      >
        {isSpinning ? (
          <>
            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
            Girando...
          </>
        ) : (
          <>
            <Shuffle className="h-5 w-5 mr-2" />
            Girar a Roleta!
          </>
        )}
      </Button>
      
      {/* Result */}
      {selectedItem && (
        <div className="text-center animate-fade-in-up">
          <h3 className="text-xl font-bold gradient-text mb-4">
            🎬 Filme sorteado para você:
          </h3>
          <div className={`bg-gradient-to-r ${selectedItem.color} text-white p-6 rounded-xl shadow-2xl max-w-sm mx-auto`}>
            <div className="flex items-center space-x-4">
              <img 
                src={selectedItem.poster} 
                alt={selectedItem.title}
                className="w-16 h-24 object-cover rounded-lg shadow-lg"
              />
              <div className="text-left">
                <h4 className="text-lg font-bold mb-1">{selectedItem.title}</h4>
                <p className="text-sm opacity-90">Ano: {selectedItem.year}</p>
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roulette;