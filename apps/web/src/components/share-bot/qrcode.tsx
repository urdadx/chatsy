import { Download } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "../ui/button";

interface QRCodeExportProps {
  chatbotName: string;
  embedToken: string;
}


export const QRCodeExport = ({ embedToken }: QRCodeExportProps) => {
  const baseUrl = `${window.location.origin}/talk/${embedToken}`;
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${baseUrl.split("/").pop()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4 p-2 sm:p-3">
        <QRCodeCanvas
          className="mx-auto w-full qr-code"
          id="qr-code"
          level="H"
          size={Math.min(window.innerWidth * 0.6, 200)}
          value={baseUrl}
        />
        <div className="text-xs sm:text-sm text-center  font-medium">
          Share this QR code with your audience to provide access to this
          chatbot.
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="my-2 w-full text-xs sm:text-sm flex items-center justify-center gap-2"
            onClick={downloadQRCode}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </motion.div>
      </div>
    </>
  );
};
