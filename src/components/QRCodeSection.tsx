import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { Plus, QrCode } from "lucide-react";

const QRCodeSection = () => {
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");

  const addStop = () => {
    if (newStop.trim() && !stops.includes(newStop.trim())) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5" />
        QR Code Generator
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Generate QR codes for bus stops. Scanning these codes will show routes for that specific stop.
      </p>

      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Label htmlFor="stop-name" className="sr-only">
            Stop Name
          </Label>
          <Input
            id="stop-name"
            placeholder="Enter stop name (e.g., Main Street)"
            value={newStop}
            onChange={(e) => setNewStop(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addStop()}
          />
        </div>
        <Button onClick={addStop} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Stop
        </Button>
      </div>

      {stops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stops.map((stop) => (
            <QRCodeGenerator key={stop} stopName={stop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <QrCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No stops added yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add a stop name above to generate QR codes</p>
        </div>
      )}
    </Card>
  );
};

export default QRCodeSection;
