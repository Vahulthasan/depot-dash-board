import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCodeSection from "@/components/QRCodeSection";

interface BusRoute {
  id: string;
  route_number: string;
  start_location: string;
  end_location: string;
  via_places: string | null;
  bus_type: string;
  frequency_minutes: number | null;
  first_trip_time: string;
  last_trip_time: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    route_number: "",
    start_location: "",
    end_location: "",
    via_places: "",
    bus_type: "Normal",
    frequency_minutes: "",
    first_trip_time: "",
    last_trip_time: "",
  });

  const { data: routes, isLoading } = useQuery({
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

  const addRouteMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("bus_routes").insert({
        route_number: data.route_number,
        start_location: data.start_location,
        end_location: data.end_location,
        via_places: data.via_places || null,
        bus_type: data.bus_type,
        frequency_minutes: data.frequency_minutes ? parseInt(data.frequency_minutes) : null,
        first_trip_time: data.first_trip_time,
        last_trip_time: data.last_trip_time,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bus-routes"] });
      toast.success("Route added successfully!");
      setFormData({
        route_number: "",
        start_location: "",
        end_location: "",
        via_places: "",
        bus_type: "Normal",
        frequency_minutes: "",
        first_trip_time: "",
        last_trip_time: "",
      });
    },
    onError: () => {
      toast.error("Failed to add route");
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bus_routes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bus-routes"] });
      toast.success("Route deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete route");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRouteMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Route
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="route_number">Route Number *</Label>
              <Input
                id="route_number"
                value={formData.route_number}
                onChange={(e) => setFormData({ ...formData, route_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bus_type">Bus Type *</Label>
              <Select value={formData.bus_type} onValueChange={(value) => setFormData({ ...formData, bus_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_location">Start Location *</Label>
              <Input
                id="start_location"
                value={formData.start_location}
                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_location">End Location *</Label>
              <Input
                id="end_location"
                value={formData.end_location}
                onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="via_places">Via Places (comma separated)</Label>
              <Input
                id="via_places"
                value={formData.via_places}
                onChange={(e) => setFormData({ ...formData, via_places: e.target.value })}
                placeholder="Stop1, Stop2, Stop3"
              />
            </div>
            <div>
              <Label htmlFor="first_trip_time">First Trip Time *</Label>
              <Input
                id="first_trip_time"
                type="time"
                value={formData.first_trip_time}
                onChange={(e) => setFormData({ ...formData, first_trip_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_trip_time">Last Trip Time *</Label>
              <Input
                id="last_trip_time"
                type="time"
                value={formData.last_trip_time}
                onChange={(e) => setFormData({ ...formData, last_trip_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency_minutes">Frequency (minutes)</Label>
              <Input
                id="frequency_minutes"
                type="number"
                value={formData.frequency_minutes}
                onChange={(e) => setFormData({ ...formData, frequency_minutes: e.target.value })}
                placeholder="e.g., 15"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={addRouteMutation.isPending}>
                {addRouteMutation.isPending ? "Adding..." : "Add Route"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Routes</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading routes...</p>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-2">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-primary">{route.route_number}</span>
                      <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">{route.bus_type}</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {route.start_location} → {route.end_location}
                    </p>
                    {route.via_places && (
                      <p className="text-xs text-muted-foreground">Via: {route.via_places}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteRouteMutation.mutate(route.id)}
                    disabled={deleteRouteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No routes added yet. Add your first route above!</p>
          )}
        </Card>

        <Separator className="my-8" />

        <QRCodeSection />
      </main>
    </div>
  );
};

export default Admin;
