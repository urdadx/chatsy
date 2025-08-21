import { RiCheckboxCircleFill } from "@remixicon/react";
import { AlertTriangle } from "lucide-react";

interface EscalateToHumanNotificationProps {
  reason: string;
  message?: string;
  success?: boolean;
  error?: string;
}

export function EscalateToHumanNotification({
  message,
  success = true,
  error,
}: EscalateToHumanNotificationProps) {
  const isSuccess = success && !error;

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        isSuccess ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {isSuccess ? (
          <RiCheckboxCircleFill className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600" />
        )}
        <h3 className="font-semibold text-gray-900">
          {isSuccess ? "Escalated to Human Agent" : "Escalation Failed"}
        </h3>
      </div>

      <p className="text-gray-700">
        {message ||
          (isSuccess
            ? "Your conversation has been escalated to a human agent who will assist you shortly."
            : "There was an issue escalating your chat. Our team has been notified and will reach out to you.")}
      </p>

      {error && (
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">
            We encountered an issue, Our team has been notified and will reach
            out to you shortly.
          </h3>
        </div>
      )}
    </div>
  );
}
