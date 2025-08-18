-- Add onboarding completion and favorite genres to profiles
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN favorite_genres INTEGER[] DEFAULT '{}',
ADD COLUMN preferred_duration TEXT DEFAULT 'any',
ADD COLUMN preferred_rating TEXT DEFAULT 'any';

-- Create user interactions table for behavior tracking
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie',
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'search', 'favorite', 'rating'
  interaction_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_interactions
CREATE POLICY "Users can view their own interactions" 
ON public.user_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" 
ON public.user_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create watch history table
CREATE TABLE public.watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie',
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  watch_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS on watch_history
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies for watch_history
CREATE POLICY "Users can view their own watch history" 
ON public.watch_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watch history" 
ON public.watch_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" 
ON public.watch_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user ratings table
CREATE TABLE public.user_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'movie',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id, media_type)
);

-- Enable RLS on user_ratings
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ratings
CREATE POLICY "Users can view their own ratings" 
ON public.user_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" 
ON public.user_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.user_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for user_ratings updated_at
CREATE TRIGGER update_user_ratings_updated_at
BEFORE UPDATE ON public.user_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_movie_id ON public.user_interactions(movie_id);
CREATE INDEX idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX idx_watch_history_movie_id ON public.watch_history(movie_id);
CREATE INDEX idx_user_ratings_user_id ON public.user_ratings(user_id);
CREATE INDEX idx_user_ratings_movie_id ON public.user_ratings(movie_id);