import { QRCodeCanvas } from "qrcode.react";
import { Button } from "../ui/button";

export const QRCodeExport = ({ chatbotName }: { chatbotName: string }) => {
  const baseUrl = `${window.location.origin}/bio-page/${chatbotName}`;
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
        <Button
          className="my-2 w-full text-xs sm:text-sm "
          onClick={downloadQRCode}
        >
          Download
        </Button>
      </div>
    </>
  );
};
