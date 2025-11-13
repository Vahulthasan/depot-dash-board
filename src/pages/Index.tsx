import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BusTimingTable from "@/components/BusTimingTable";
import SearchBar from "@/components/SearchBar";
import { Shield, RefreshCw, Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ["bus-routes"],
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

  // Manual refresh
  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
    toast.success("Bus timings refreshed!");
  };

  // Filter routes based on search query
  const filteredRoutes = routes?.filter((route) => {
    const query = searchQuery.toLowerCase();
    return (
      route.route_number.toLowerCase().includes(query) ||
      route.start_location.toLowerCase().includes(query) ||
      route.end_location.toLowerCase().includes(query) ||
      route.via_places?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 p-2 rounded-lg">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Bus Timings</h1>
                <p className="text-sm text-primary-foreground/80">Live schedule updates</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search and Refresh */}
        <div className="mb-6 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Bus Timing Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bus timings...</p>
          </div>
        ) : (
          <BusTimingTable routes={filteredRoutes || []} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Bus timings manually collected from depot</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
