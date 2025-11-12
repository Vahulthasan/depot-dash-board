-- Create bus routes table
CREATE TABLE public.bus_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_number TEXT NOT NULL UNIQUE,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  via_places TEXT,
  bus_type TEXT NOT NULL CHECK (bus_type IN ('Normal', 'Express', 'AC')),
  frequency_minutes INTEGER,
  first_trip_time TIME NOT NULL,
  last_trip_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bus timings table (individual schedule entries)
CREATE TABLE public.bus_timings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  stop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_timings ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view bus schedules)
CREATE POLICY "Anyone can view bus routes"
  ON public.bus_routes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view bus timings"
  ON public.bus_timings
  FOR SELECT
  USING (true);

-- Public write access for admin panel (locked mode - anyone can manage via admin UI)
CREATE POLICY "Anyone can insert bus routes"
  ON public.bus_routes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update bus routes"
  ON public.bus_routes
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete bus routes"
  ON public.bus_routes
  FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert bus timings"
  ON public.bus_timings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update bus timings"
  ON public.bus_timings
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete bus timings"
  ON public.bus_timings
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bus_routes_updated_at
  BEFORE UPDATE ON public.bus_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better search performance
CREATE INDEX idx_bus_routes_route_number ON public.bus_routes(route_number);
CREATE INDEX idx_bus_routes_start_location ON public.bus_routes(start_location);
CREATE INDEX idx_bus_routes_end_location ON public.bus_routes(end_location);
CREATE INDEX idx_bus_timings_route_id ON public.bus_timings(route_id);