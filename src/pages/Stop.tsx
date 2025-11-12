import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BusTimingTable from "@/components/BusTimingTable";
import { ArrowLeft, Bus } from "lucide-react";

interface BusRoute {
  id: string;
  route_number: string;
  start_location: string;
  end_location: string;
  via_places: string | null;
  bus_type: string;
  first_trip_time: string;
  last_trip_time: string;
  frequency_minutes: number | null;
}

const Stop = () => {
  const { stopName } = useParams<{ stopName: string }>();
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ["bus-routes", stopName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bus_routes")
        .select("*")
        .order("route_number");
      if (error) throw error;
      return data as BusRoute[];
    },
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Filter routes that pass through this stop
  const filteredRoutes = routes?.filter((route) => {
    const stop = stopName?.toLowerCase();
    return (
      route.start_location.toLowerCase().includes(stop || "") ||
      route.end_location.toLowerCase().includes(stop || "") ||
      route.via_places?.toLowerCase().includes(stop || "")
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 p-2 rounded-lg">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold capitalize">
                  {stopName?.replace(/-/g, " ")}
                </h1>
                <p className="text-sm text-primary-foreground/80">Bus stop schedule</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bus timings...</p>
          </div>
        ) : (
          <BusTimingTable routes={filteredRoutes || []} />
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Bus timings manually collected from depot</p>
        </div>
      </footer>
    </div>
  );
};

export default Stop;
