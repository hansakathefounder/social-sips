-- Create events table for restaurant event posters
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are viewable by everyone
CREATE POLICY "Events are viewable by everyone"
ON public.events
FOR SELECT
USING (true);

-- Restaurant owners can create events for their restaurants
CREATE POLICY "Restaurant owners can create events"
ON public.events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = events.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can update their events
CREATE POLICY "Restaurant owners can update events"
ON public.events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = events.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can delete their events
CREATE POLICY "Restaurant owners can delete events"
ON public.events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = events.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();