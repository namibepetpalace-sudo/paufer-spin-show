import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Sparkles } from "lucide-react";

const rouletteItems = [
  { id: 1, title: "Ação & Aventura", color: "from-netflix-red to-red-600" },
  { id: 2, title: "Comédia", color: "from-netflix-red/80 to-orange-600" },
  { id: 3, title: "Drama", color: "from-netflix-red/60 to-red-700" },
  { id: 4, title: "Terror", color: "from-netflix-red/90 to-red-800" },
  { id: 5, title: "Ficção Científica", color: "from-netflix-red/70 to-red-500" },
  { id: 6, title: "Romance", color: "from-netflix-red/85 to-pink-600" },
  { id: 7, title: "Thriller", color: "from-netflix-red/75 to-gray-700" },
  { id: 8, title: "Documentário", color: "from-netflix-red/65 to-orange-700" },
];

const Roulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof rouletteItems[0] | null>(null);
  const [rotation, setRotation] = useState(0);

  const spinRoulette = () => {
    if (isSpinning) return;
    
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
                  className="absolute text-white text-sm font-semibold"
                  style={{
                    top: '30%',
                    left: '60%',
                    transform: `rotate(${angle + (360 / rouletteItems.length) / 2}deg)`,
                    transformOrigin: '0 100%',
                    width: '80px'
                  }}
                >
                  {item.title}
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
          <h3 className="text-xl font-bold gradient-text mb-2">
            Você deve assistir:
          </h3>
          <div className={`bg-gradient-to-r ${selectedItem.color} text-white px-6 py-3 rounded-lg shadow-lg`}>
            <span className="text-lg font-semibold">{selectedItem.title}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roulette;