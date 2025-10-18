import { Button } from "@/components/ui/button";

interface CustomButtonProps {
  buttonText: string;
  buttonUrl: string;
  name?: string | null;
  description?: string | null;
  context?: string;
  color?: string;
}

export function CustomButton({
  buttonText,
  buttonUrl,
  color = "#2563eb",
}: CustomButtonProps) {
  const handleClick = () => {
    window.open(buttonUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-3 p-2 rounded-lg max-w-md">

      {/* <p className="text-sm ">Please click the button below to continue</p> */}

      <Button
        onClick={handleClick}
        className="flex items-center gap-2 text-white"
        style={{ backgroundColor: color }}
      >
        <span>{buttonText}</span>
      </Button>
    </div>
  );
}
