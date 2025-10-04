import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useToast } from "@/hooks/use-toast";

const interests = [
  "Action",
  "Drama",
  "Comedy",
  "Horror",
  "Adventure",
  "Thriller",
  "Romance",
  "Sci-fi",
  "Documentary",
  "Crime",
  "Fantasy",
  "Mystery",
  "Sports",
  "K-Drama",
  "Anime",
];

export default function OnboardingInterests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveGenrePreferences } = usePersonalization();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      toast({
        title: "Select at least one interest",
        description: "Please choose your favorite genres to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      // Map genre names to TMDb genre IDs (simplified mapping)
      const genreMap: Record<string, number> = {
        Action: 28,
        Drama: 18,
        Comedy: 35,
        Horror: 27,
        Adventure: 12,
        Thriller: 53,
        Romance: 10749,
        "Sci-fi": 878,
        Documentary: 99,
        Crime: 80,
        Fantasy: 14,
        Mystery: 9648,
        Sports: 9648,
        "K-Drama": 18,
        Anime: 16,
      };

      const genreIds = selectedInterests
        .map((interest) => genreMap[interest])
        .filter(Boolean);

      await saveGenrePreferences(genreIds);
      
      localStorage.setItem("onboarding_completed", "true");
      navigate("/");
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 pb-24">
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Interests</h1>
          <p className="text-muted-foreground">
            Select your favorite genres to get personalized recommendations
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {interests.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <Badge
                key={interest}
                variant={isSelected ? "default" : "outline"}
                className="px-6 py-3 text-base cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
        <div className="flex gap-4 max-w-screen-xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14"
            onClick={() => {
              localStorage.setItem("onboarding_completed", "true");
              navigate("/");
            }}
          >
            Skip
          </Button>
          <Button
            size="lg"
            className="flex-1 h-14"
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
