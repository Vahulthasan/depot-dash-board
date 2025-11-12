import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeGeneratorProps {
  stopName: string;
}

const QRCodeGenerator = ({ stopName }: QRCodeGeneratorProps) => {
  const url = `${window.location.origin}/stop/${stopName.toLowerCase().replace(/\s+/g, "-")}`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${stopName}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${stopName}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="p-4 text-center">
      <p className="text-sm font-medium mb-3">{stopName}</p>
      <div className="bg-white p-4 rounded-lg inline-block">
        <QRCodeSVG
          id={`qr-${stopName}`}
          value={url}
          size={128}
          level="H"
          includeMargin
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadQR}
        className="mt-3 gap-2"
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
    </Card>
  );
};

export default QRCodeGenerator;
