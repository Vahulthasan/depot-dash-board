import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bus, MapPin, Clock } from "lucide-react";

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

interface BusTimingTableProps {
  routes: BusRoute[];
}

const BusTimingTable = ({ routes }: BusTimingTableProps) => {
  const getBusTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "AC":
        return "default";
      case "Express":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "-";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!routes || routes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">No bus routes found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or check back later</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {routes.map((route) => (
          <Card key={route.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground font-bold text-lg px-3 py-1 rounded-md">
                  {route.route_number}
                </div>
                <Badge variant={getBusTypeBadgeVariant(route.bus_type)}>{route.bus_type}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">{route.start_location}</p>
                  <p className="text-muted-foreground">→ {route.end_location}</p>
                </div>
              </div>
              {route.via_places && (
                <p className="text-xs text-muted-foreground pl-6">Via: {route.via_places}</p>
              )}
              <div className="flex items-center gap-2 text-sm pl-6">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatTime(route.first_trip_time)}</span>
                <span className="text-muted-foreground">-</span>
                <span className="font-medium">{formatTime(route.last_trip_time)}</span>
              </div>
              {route.frequency_minutes && (
                <p className="text-xs text-muted-foreground pl-6">Every {route.frequency_minutes} mins</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Route</TableHead>
              <TableHead className="font-semibold">From</TableHead>
              <TableHead className="font-semibold">To</TableHead>
              <TableHead className="font-semibold">Via</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">First Trip</TableHead>
              <TableHead className="font-semibold">Last Trip</TableHead>
              <TableHead className="font-semibold">Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-md inline-block">
                    {route.route_number}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{route.start_location}</TableCell>
                <TableCell className="font-medium">{route.end_location}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {route.via_places || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={getBusTypeBadgeVariant(route.bus_type)}>{route.bus_type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatTime(route.first_trip_time)}</TableCell>
                <TableCell className="font-medium">{formatTime(route.last_trip_time)}</TableCell>
                <TableCell className="text-sm">
                  {route.frequency_minutes ? `${route.frequency_minutes} mins` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BusTimingTable;
